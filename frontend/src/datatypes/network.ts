import { Node } from "./tree";
import {EvaluationDirection, Operator} from "./settings";
export interface Task {
    inputSegments: string[];
    template: string;
    target: string;
    operator: Operator;
    originalPrediction?: any;
    predefinedEditHierarchy?: Node;
    taskId?: string;
}
export interface ParseAndPredictResponse{
    inputSegments: string[];
    modelPrediction: any;
}
export interface Explanation{
    task: Task;
    group_assignments: number[];
    attributions: number[];
    execution_time: number;
    n_samples_generated: number;
    direction: EvaluationDirection;
    differences?: number[];
    edit_hierarchy? : Node;
    sample_name?: string;
    sample_id: string;
    model_to_explain?: string;
}
export interface SampleHistory{
    samples: Explanation[];
}

export interface LineCommands{
    isFirst: boolean;
    isLast: boolean;
    breakLeft: boolean;
    breakRight: boolean;
    interruptLeft?: boolean;
    interruptRight?: boolean;
    groupSchedule: number[];
}

export interface PersonalInformation {
    userName : string;
    educationalBackground? : string;
    occupation? : string;
    researchField? : string;
    // TODO: What other information should be collected?
}