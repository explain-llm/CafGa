import uuid
from fastapi import APIRouter, HTTPException, Cookie, Response
from typing import Annotated

from ..datatypes.text import (
    ParseRequest,
    ParseResponse,
    EvaluationRequest,
    Explanation,
    SampleHistory,
)
from ..datatypes.exceptions import UserDoesNotExistException, SampleDoesNotExistException
from ..services.attribution_service import attribute_and_evaluate, parse
from ..persistence.samplePersister import (
    save_sample,
    load_samples,
    delete_sample,
    delete_all_samples,
)

health_router = APIRouter(prefix="/health", tags=["Health"])
@health_router.get("/")
def health_check():
    return {"status": "ok"}
router = APIRouter(prefix="/groupedText", tags=["CafGa"])


@router.get("/history")
def get_sample_history(
    response: Response, user_id: Annotated[str | None, Cookie()] = None
) -> SampleHistory:
    """
    Get the history of samples for a user.

    Parameters
    ----------
    user_id : str | None
        The id of the user. If None, a new user id will be generated.
    response : Response
        The fastAPI response object to set the cookie.

    Returns
    -------
    SampleHistory: The history of samples for the user.
    """
    print("User id: ", user_id)
    if user_id is None:
        user_id = str(uuid.uuid4())
        print("Generated new user id: ", user_id)
        response.set_cookie(
            key="user_id", 
            value=user_id, 
            max_age=31536000, 
            secure=True, 
            samesite="Lax"
        )

    sample_history = load_samples(user_id)
    return SampleHistory(samples=sample_history)


@router.post("/parse")
def post_text_for_parsing(body: ParseRequest) -> ParseResponse:
    """
    Parse the given text and get the model's original prediction for the task.

    Parameters
    ----------
    body : ParseAndPredictRequest
        The request body containing the text to parse and the task for which the prediction should be made.

    Returns
    -------
    ParseAndPredictResponse: The parsed text and the model's prediction for the task.
    """
    unparsed_input = body.unparsed_input
    task = body.task
    parse(unparsed_input, task)  # Directly updates the task object
    return task


@router.post("/attribute")
def post_text_for_attribution(
    body: EvaluationRequest, response: Response, user_id: Annotated[str | None, Cookie()] = None
) -> Explanation:
    """
    Generate attributions for the given sample and then evaluate the attributions. Save the sample to the user's history and return the evaluated sample to the frontend.

    Parameters
    ----------
    body : EvaluationRequest
        The request body containing the sample to attribute and evaluate.
    user_id : str | None
        The id of the user. If None, a new user id will be generated.
    response : Response
        The fastAPI response object to set the cookie.

    Returns
    -------
    Explanation: The evaluated sample
    """
    if user_id is None:
        user_id = str(uuid.uuid4())
        print("Generated new user id: ", user_id)
        response.set_cookie(key="user_id", value=user_id, max_age=31536000)
    use_model_answer = body.task.target == "{model}"
    assignments = body.assignments
    direction = body.direction
    edit_hierarchy = body.edit_hierarchy
    model_to_explain = body.model_to_explain
    attributions, original_prediction, computation_time, n_generated_samples, differences = (
        attribute_and_evaluate(body.task, assignments, model_to_explain, direction)
    )
    body.task.originalPrediction = original_prediction
    if use_model_answer:
        body.task.target = "{model}"
    evaluated_sample = Explanation(
        task=body.task,
        group_assignments=assignments,
        attributions=attributions,
        execution_time=computation_time,
        n_samples_generated=n_generated_samples,
        direction=direction,
        differences=differences,
        edit_hierarchy=edit_hierarchy,
        sample_name=body.sample_name,
        sample_id=str(uuid.uuid4()),
        model_to_explain=model_to_explain,
    )
    save_sample(user_id, evaluated_sample)
    return evaluated_sample


@router.delete("/history")
def delete_complete_history(user_id: Annotated[str | None, Cookie()] = None) -> None:
    """
    Delete the complete history of samples for a user.

    Parameters
    ----------
    user_id : str | None
        The id of the user. If None, a new user id will be generated.

    Returns
    -------
    None
    """
    if user_id is None:
        raise HTTPException(401, "Not Authenticated")
    try:
        delete_all_samples(user_id)
    except UserDoesNotExistException:
        raise HTTPException(404, "User does not exist")
    except SampleDoesNotExistException:
        raise HTTPException(404, "Sample does not exist")
    return


@router.delete("/")
def delete_given_sample(
    sample_id: str,
    user_id: Annotated[str | None, Cookie()] = None,
) -> None:
    """
    Delete a sample by its id.

    Parameters
    ----------
    sample_id : str
        The id of the sample to delete.
    user_id : str | None
        The id of the user. If None, a new user id will be generated.

    Returns
    -------
    None
    """
    if user_id is None:
        raise HTTPException(401, "Not Authenticated")
    try:
        delete_sample(user_id, sample_id)
    except UserDoesNotExistException:
        raise HTTPException(404, "User does not exist")
    except SampleDoesNotExistException:
        raise HTTPException(404, "Sample does not exist")
    return
