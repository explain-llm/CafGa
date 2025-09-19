import os
import json
import pickle
import uuid
import random
from os.path import join as pjoin

from ..datatypes.text import Explanation, SampleHistory
from ..datatypes.study import ComparableExplanation, ExplanationMethod, ComparisonStudyResults, PersonalInformation,PersonalInformationPostRequest
from ..datatypes.exceptions import UserDoesNotExistException


database_dir = pjoin(os.path.dirname(__file__), "..", "..", "dataBase")
study_dir = pjoin(os.path.dirname(__file__), "..", "..", "ComparisonStudy")
users_dir = pjoin(study_dir, "users")
explanation_dir = pjoin(study_dir, "explanations")
explanation_registry_path = pjoin(study_dir, "ExplanationRegistry.pkl")
user_registry_path = pjoin(study_dir, "UserRegistry.pkl") # Map from user_id to PersonalInformation
non_explanation_files = ["personalInformation.json", "UserRegistry.pkl"]

def save_sample(user_id: str, sample: Explanation):
    if user_id is None:
        raise ValueError("User id cannot be None")
    user_dir = pjoin(database_dir, user_id)
    os.makedirs(user_dir, exist_ok=True)
    sample_id = sample.sample_id
    with open(pjoin(user_dir, f"{sample_id}.json"), "w") as f:
        f.write(sample.model_dump_json())


def load_samples(user_id: str) -> SampleHistory:
    user_dir = pjoin(database_dir, user_id)
    if not os.path.exists(user_dir):
        return []
    samples = []
    for file in os.listdir(user_dir):
        if file.endswith(".json"):
            with open(pjoin(user_dir, file), "r") as f:
                sample_data = json.load(f)
                sample = Explanation(**sample_data)
                samples.append(sample)
    return samples


def delete_sample(user_id: str, sample_id: str):
    user_dir = pjoin(database_dir, user_id)
    if not os.path.exists(user_dir):
        raise UserDoesNotExistException(user_id)
    sample_file = pjoin(user_dir, f"{sample_id}.json")
    if not os.path.exists(sample_file):
        raise FileNotFoundError(f"Sample {sample_id} does not exist for user {user_id}")
    os.remove(sample_file)


def delete_all_samples(user_id: str):
    user_dir = pjoin(database_dir, user_id)
    if not os.path.exists(user_dir):
        raise UserDoesNotExistException(user_id)
    for file in os.listdir(user_dir):
        if file.endswith(".json"):
            os.remove(pjoin(user_dir, file))

def register_user(user_id: str, registration_request: PersonalInformationPostRequest) -> dict[str, bool]:
    errors = {
        "user_already_registered": False,
        "name_exists": False,
        "name_change": False,
        "assign_existing_id": None,
    }
    personalInformation = registration_request.personalInformation
    confirmSamePerson = registration_request.confirmSamePerson
    confirmChangeInformation = registration_request.confirmChangeInformation
    user_registry : dict[str, PersonalInformation] = {}
    if os.path.exists(user_registry_path):
        with open(user_registry_path, "rb") as f:
            user_registry = pickle.load(f)
    registered_usernames = {info.userName :  user_id for user_id, info in user_registry.items()}

    if user_id in user_registry:
        if user_registry[user_id].userName != personalInformation.userName:
            errors["name_change"] = True
            return errors
        existing_record = user_registry[user_id]
        existsDiscrepancy = False
        for key in existing_record.__dict__:
            if existing_record.__dict__[key] != personalInformation.__dict__[key]:
                existsDiscrepancy = True
                break
        if existsDiscrepancy and not confirmChangeInformation:
            errors["user_already_registered"] = True
            return errors

    if personalInformation.userName in registered_usernames:
        if registered_usernames[personalInformation.userName] != user_id:
            if not confirmSamePerson:
                errors["name_exists"] = True
                return errors
            else:
                errors["assign_existing_id"] = registered_usernames[personalInformation.userName]

    user_dir = pjoin(users_dir, user_id)
    user_registry[user_id] = personalInformation
    with open(user_registry_path, "wb") as f:
        pickle.dump(user_registry, f)
    os.makedirs(user_dir, exist_ok=True)
    with open(pjoin(user_dir, "personalInformation.json"), "w") as f:
        f.write(personalInformation.model_dump_json())
    return errors

def save_submitted_explanation(user_id : str, explanation: Explanation):
    if user_id is None:
        raise ValueError("User id cannot be None")
    if explanation.task.taskId is None:
        raise ValueError("Task ID is missing")

    if not os.path.exists(explanation_registry_path):
        explanation_registry = {}
    else:
        with open(explanation_registry_path, "rb") as f:
            explanation_registry = pickle.load(f)
    task_id = explanation.task.taskId
    explanation_subpath = pjoin(user_id, f"{task_id}.json")

    if task_id not in explanation_registry:
        explanation_registry[task_id] = [explanation_subpath]
    else:
        explanation_registry[task_id].append(explanation_subpath)
    with open(explanation_registry_path, "wb") as f:
        pickle.dump(explanation_registry, f)

    file_loc = pjoin(users_dir, explanation_subpath)
    user_dir = pjoin(users_dir, user_id)
    os.makedirs(user_dir, exist_ok=True)
    with open(file_loc, "w") as f:
        f.write(explanation.model_dump_json())

def get_explanation_registry() -> dict[str, list[str]]:
    explanation_registry: dict[str, list[str]] = {}
    users = os.listdir(users_dir)
    for user in users:
        user_dir = pjoin(users_dir, user)
        if not os.path.isdir(user_dir):
            continue
        explanation_files = os.listdir(user_dir)
        for explanation_file in explanation_files:
            if explanation_file in non_explanation_files:
                continue
            if explanation_file.endswith(".json"):
                task_id = explanation_file.split(".")[0]
                if task_id not in explanation_registry:
                    explanation_registry[task_id] = []
                explanation_registry[task_id].append(pjoin(user, explanation_file))
    return explanation_registry

def load_explanation_array(user_id : str, task_id: str) -> list[ComparableExplanation]:
    """
    Load the explanations for a given task.

    The order in which the explanations are loaded is:
    1. Human explanation
    2. MexGen explanation
    3. PSHAP explanation
    The front end shuffles the explanations before displaying them to the user.
    """
    task_dir = pjoin(explanation_dir, task_id)
    explanation_registry = get_explanation_registry()
    explanation_subpaths = explanation_registry[task_id]
    allowed_subpaths = [subpath for subpath in explanation_subpaths if user_id not in subpath]
    random_index = random.randint(0, len(allowed_subpaths) - 1)
    explanation_subpath = allowed_subpaths[random_index]
    human_explanation_path = pjoin(users_dir, explanation_subpath)
    explanation_creator_id = explanation_subpath.split(os.path.sep)[0]
    if not os.path.exists(task_dir):
        return []
    explanations = []
    with open(human_explanation_path, "r") as f:
        sample_data = json.load(f)
        sample = Explanation(**sample_data)
        human_explanation = ComparableExplanation(
            explanation=sample,
            userId=explanation_creator_id,
            taskId=task_id,
            explanationMethod=ExplanationMethod.HUMAN,
        )
        explanations.append(human_explanation)
    with open(pjoin(task_dir, "mexgen.json"), "r") as f:
        sample_data = json.load(f)
        sample = Explanation(**sample_data)
        mexgen_explanation = ComparableExplanation(
            explanation=sample,
            userId=explanation_creator_id,
            taskId=task_id,
            explanationMethod=ExplanationMethod.MEXGEN,
        )
        explanations.append(mexgen_explanation)
    with open(pjoin(task_dir, "pshap.json"), "r") as f:
        sample_data = json.load(f)
        sample = Explanation(**sample_data)
        # Scale the attributions from PSHAP because they tend to be much lower
        # and thus don't pop as well on the colour scale that the front end uses
        max_attr = max(sample.attributions, key=abs)
        if (max_attr < 0.5):
            noise = random.uniform(0.0, 0.05) # So users can't track the pshap explanations based on the attributions
            ratio = (0.5+noise) / max_attr
            for attr_index in range(len(sample.attributions)):
                # Only scale attributions that are large enough to be visible
                if abs(sample.attributions[attr_index]) > 0.05:
                    sample.attributions[attr_index] *= ratio
        pshap_explanation = ComparableExplanation(
            explanation=sample,
            userId=explanation_creator_id,
            taskId=task_id,
            explanationMethod=ExplanationMethod.PSHAP,
        )
        explanations.append(pshap_explanation)
    return explanations

tasks_in_order = [
    "SQUAD",
    "restaurantReview",
    "promptEngineering",
    "complexQA",
    "longFormText",
]

def load_explanation_comparison_array(
    user_id: str,
    n_comparisons: int,
) -> list[list[ComparableExplanation]]:
    """
    Load a list of lists each containing a set of explanations to be compared.
    Parameters
    ----------
    n_comparisons : int
        The number of comparisons to load.

    Returns
    -------
    list[ComparableExplanation]: The explanation array for the user.
    """
    explanation_comparison_array = []
    # Basd idea
    # if not os.path.exists(explanation_registry_path):
    #     raise FileNotFoundError("Tried to load explanations before any were submitted.")
    # with open(explanation_registry_path, "rb") as f:
    #     explanation_registry : dict[str,list[str]] = pickle.load(f)
    explanation_registry = get_explanation_registry()
    # Don't let user get an explanation that they've generated
    emptied_tasks = []
    for task_id, explanation_subpaths in explanation_registry.items():
        for subpath in explanation_subpaths:
            if user_id == subpath.split(os.path.sep)[0]:
                explanation_subpaths.remove(subpath)
        if len(explanation_subpaths) == 0:
            emptied_tasks.append(task_id)
    for task_id in emptied_tasks:
        del explanation_registry[task_id]

    available_tasks = list(explanation_registry.keys()) 

    n_task_types = len(tasks_in_order)
    n_repeats = n_comparisons // n_task_types
    for i in range(n_comparisons):
        task_type = tasks_in_order[(i // n_repeats) % n_task_types]
        available_tasks_at_type = [task_id for task_id in available_tasks if task_type in task_id]
        if len(available_tasks_at_type) == 0:
            continue
        random_index = random.randint(0, len(available_tasks_at_type) - 1)
        task_id = available_tasks_at_type[random_index]
        available_tasks.remove(task_id)
        explanation_comparison_array.append(load_explanation_array(user_id, task_id))

    return explanation_comparison_array


def save_study_results(user_id : str, results : ComparisonStudyResults):
    results_dir = pjoin(study_dir, "results", user_id)
    os.makedirs(results_dir, exist_ok=True)
    with open(pjoin(results_dir, f"{str(uuid.uuid4())}.json"), "w") as f:
        f.write(results.model_dump_json())
