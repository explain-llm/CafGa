import { Node } from "./tree";
import {EvaluationDirection, Operator} from "./settings";
export interface Task {
    inputSegments: string[];
    template: string;
    target: string;
    operator: Operator;
    originalPrediction?: any;
    predefinedEditHierarchy?: Node;
}
export interface ParseAndPredictResponse{
    inputSegments: string[];
    modelPrediction: any;
}
export interface GroupAttributionResponse{
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
}
export interface SampleHistory{
    samples: GroupAttributionResponse[];
}
export interface LineCommands{
    isFirst: boolean;
    isLast: boolean;
    breakLeft: boolean;
    breakRight: boolean;
    groupSchedule: number[];
}