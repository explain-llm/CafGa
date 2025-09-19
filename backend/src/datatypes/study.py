from pydantic import BaseModel
from .text import Explanation
from enum import Enum
from typing import Optional

class ExplanationMethod(Enum):
    PSHAP = "PSHAP"
    MEXGEN = "MEXGEN"
    HUMAN = "HUMAN"

class PersonalInformation(BaseModel):
    userName: str
    educationalBackground: Optional[str] = None
    occupation: Optional[str] = None
    researchField: Optional[str] = None

class PersonalInformationPostRequest(BaseModel):
    personalInformation: PersonalInformation
    confirmSamePerson: Optional[bool] = False
    confirmChangeInformation: Optional[bool] = False

class PersonalInformationPostResponse(BaseModel):
    userAlreadyRegistered: bool
    nameExists: bool
    nameChange: bool


class ComparableExplanation(BaseModel):
    explanation: Explanation
    userId: str
    taskId: str
    explanationMethod: ExplanationMethod

class ExplanationComparisonArrayResponse(BaseModel):
    explanationComparisonArray: list[list[ComparableExplanation]]

class ComparisonResult(BaseModel):
    preferredMethod: ExplanationMethod
    userId : str
    taskId: str

class ComparisonStudyResults(BaseModel):
    comparisonResults: list[ComparisonResult]
