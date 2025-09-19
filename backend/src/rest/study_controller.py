import uuid
from fastapi import APIRouter, Cookie, Response
from typing import Annotated
from ..datatypes.text import Explanation
from ..datatypes.exceptions import UnregisteredUserException
from ..datatypes.study import (
    PersonalInformationPostRequest,
    PersonalInformationPostResponse,
    ExplanationComparisonArrayResponse,
    ComparisonStudyResults,
)
from ..persistence.samplePersister import (
    save_submitted_explanation,
    save_study_results,
    load_explanation_comparison_array,
    register_user,
)

router = APIRouter(prefix="/study", tags=["CafGa-study"])

tasks_to_ignore = ["custom", "example"]

@router.get("/explanationComparisonArray")
def get_explanation_array(
    response: Response,
    n_comparisons : int,
    user_id: Annotated[str | None, Cookie()] = None,
) -> ExplanationComparisonArrayResponse:
    """
    Get the explanation array for the user.

    Parameters
    ----------
    user_id : str | None
        The id of the user. If None, a new user id will be generated.
    response : Response
        The fastAPI response object to set the cookie.
    n_comparisons : int
        The number of comparisons to be made in the study.

    Returns
    -------
    ExplanationComparisonArrayResponse: An array containing lists of explanations to be compared.
    """
    if user_id is None:
        user_id = str(uuid.uuid4())
        response.set_cookie(key="user_id", value=user_id, max_age=31536000)

    explanationComparisonArray = load_explanation_comparison_array(user_id,n_comparisons)
    return ExplanationComparisonArrayResponse(
        explanationComparisonArray=explanationComparisonArray
    )


@router.post("/personalInformation")
def post_personal_information(
    response: Response,
    personal_information_post_request: PersonalInformationPostRequest,
    user_id: Annotated[str, Cookie()],
) -> PersonalInformationPostResponse:
    """
    Post the personal information of the user.

    Parameters
    ----------
    user_id : str
        The id of the user.
    response : Response
        The fastAPI response object to set the cookie.
    personal_information : dict
        The personal information of the user.
    """
    if user_id is None:
        raise UnregisteredUserException()
    errors = register_user(user_id, personal_information_post_request)
    if errors["assign_existing_id"] is not None:
        response.set_cookie(key="user_id", value=errors["assign_existing_id"], max_age=31536000)

    return PersonalInformationPostResponse(
        userAlreadyRegistered=errors["user_already_registered"],
        nameExists=errors["name_exists"],
        nameChange=errors["name_change"],
    )


@router.post("/submitExplanation")
def post_explanation(
    response: Response, explanation: Explanation, user_id: Annotated[str, Cookie()],
) -> dict:
    """
    Post an explanation for the comparison study.

    Parameters
    ----------
    user_id : str
        The id of the user.
    response : Response
        The fastAPI response object to set the cookie.
    explanation : ExplanationComparisonArrayResponse
        The explanation of the comparison study.
    """
    if user_id is None:
        raise UnregisteredUserException()
    
    if explanation.task.taskId in tasks_to_ignore:
        return {"message": "Explanation Ignored because it is not a valid task."}
    save_submitted_explanation(user_id, explanation)

    return {"message": "Explanation received."}


@router.post("/results")
def post_results(
    response: Response,
    user_id: Annotated[str, Cookie()],
    results: ComparisonStudyResults,
) -> dict:
    """
    Post the results of the comparison study.

    Parameters
    ----------
    user_id : str
        The id of the user.
    response : Response
        The fastAPI response object to set the cookie.
    results : ComparisonStudyResults
        The results of the comparison study.
    """
    if user_id is None:
        raise UnregisteredUserException()
    save_study_results(user_id, results)
    return {"message": "Results received."}
