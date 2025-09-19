import pydantic
from typing import Optional
import enum
from src.datatypes.tree import Node


class Operator(enum.Enum):
    START_WITH = "START_WITH"
    END_WITH = "END_WITH"
    EQUAL = "EQUAL"
    CONTAIN = "CONTAIN"
    SEMANTIC_EQUAL = "SEMANTIC_EQUAL"
    ENTAIL = "ENTAIL"
    CONTRADICT = "CONTRADICT"


class Task(pydantic.BaseModel):
    inputSegments: list[str]
    template: str
    target: str
    operator: Operator
    originalPrediction: Optional[float | list[str]] = None
    predefinedEditHierarchy: Optional[Node] = None
    taskId: Optional[str] = "custom"


class ParseRequest(pydantic.BaseModel):
    unparsed_input: str
    task: Task


class ParseResponse(Task):
    pass


class EvaluationRequest(pydantic.BaseModel):
    task: Task
    assignments: list[int]
    direction: str
    edit_hierarchy: Node
    sample_name: Optional[str] = None
    model_to_explain: str


class Explanation(pydantic.BaseModel):
    task: Task
    group_assignments: list[int]
    attributions: list[float]
    execution_time: float
    n_samples_generated: int
    direction: str
    differences: list[float]
    edit_hierarchy: Node
    sample_name: Optional[str] = None
    sample_id: str
    model_to_explain: str = "gpt-4o-mini"


class SampleHistory(pydantic.BaseModel):
    samples: list[Explanation]
