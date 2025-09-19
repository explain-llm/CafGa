import { Explanation } from "./network";

export enum ExplanationMethod {
    PSHAP = "PSHAP",
    MEXGEN = "MEXGEN",
    HUMAN = "HUMAN",
}

export interface PersonalInformation {
    userName: string;
    educationalBackground?: string;
    occupation?: string;
    researchField?: string;
    // TODO: What other information should be collected?
}
export interface PersonalInformationPostRequest {
    personalInformation: PersonalInformation;
    confirmSamePerson: boolean; // If get same user name, need to confirm whether it is the same person on a new device or a different person.
    confirmChangeInformation: boolean; // If cookie already has information registered need to check whether person really wants to update the information.

}
export interface PersonalInformationPostResponse {
    userAlreadyRegistered: boolean;
    nameExists: boolean;
    nameChange: boolean;
}

export interface ComparableExplanation {
    explanation: Explanation;
    userId: string;
    explanationMethod: ExplanationMethod;
}

export interface ExplanationComparisonArrayResponse {
    explanationComparisonArray: ComparableExplanation[][];
}


export interface ComparisonResult {
    preferredMethod: ExplanationMethod;
    userId: string;
    taskId: string;
}
export interface ComparisonStudyResults {
    comparisonResults: ComparisonResult[];
}

export interface CompletedTasks {
    currentLevel: number;
    completedTask_ids: string[];
}

