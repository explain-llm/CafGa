import { useEffect, useState } from "react";
import { BiLeftArrowCircle, BiRightArrowCircle } from "react-icons/bi";
// import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Node } from "../../datatypes/tree";
import { AssignmentDisplayType, EvaluationDirection } from "../../datatypes/settings";
import { Explanation, Task } from "../../datatypes/network";
import { scheduleGroupsPresentInSpan } from "../../services/GroupedTextUtils";
import { checkIsStudyP2, getSettings, incrementCurrentLevel } from "../../services/settings";
import { postExplanation } from "../../router/resources/study";
import AttributionChart from "./AttributionChart";
import AttributedText from "../InputText/AttributedText";
import ExecutionInfo from "./ExecutionInfo";
import ResponseDisplay from "./ResponseDisplay";
import TaskDescription from "./TaskDescription";
import { modulus } from "../../services/util";

interface SampleDisplayProps {
    explanation: Explanation;
    sampleIndex: number;
    commonEvaluationDirection?: EvaluationDirection;
    disableSubmission?: boolean;
    suppressEvaluationDirectionWarning?: boolean;
    hideName?: boolean;
    handleRemoveSample?: () => void;
    handleMoveToEdit?: (task:Task, editHierarchy:Node|undefined) => void;
    handleMoveToTaskEditor?: (task:Task, fromSampleDisplay? : boolean) => void;
}

const moveIconSize = 20;
const SampleDisplay = (props:SampleDisplayProps) => {
    const explanation = props.explanation;
    const execution_time = explanation.execution_time;
    const n_samples_generated = explanation.n_samples_generated;
    const inComparisonStudy = checkIsStudyP2();
    const [submitted, setSubmitted] = useState<boolean>(false);
    let initalRightDisplayIndex = 0;
    if (inComparisonStudy || props.suppressEvaluationDirectionWarning) {
        initalRightDisplayIndex = 2;
    }
    const numDisplays = 4;
    const [rightDisplayIndex, setRightDisplayIndex] = useState<number>(initalRightDisplayIndex);
    useEffect(() => {
        setRightDisplayIndex(initalRightDisplayIndex);
    }, [explanation]);

    let spans:number[][] = [];
    let groupSchedules:number[][] = [];
    const displaySettings = getSettings();
    if (displaySettings.assignmentDisplayType === AssignmentDisplayType.LINECONNECTOR){
        let schedulingValues = scheduleGroupsPresentInSpan(explanation.group_assignments);
        spans = schedulingValues[0];
        groupSchedules = schedulingValues[1];
    }
    let handleMoveToEdit = undefined;
    if (props.handleMoveToEdit != undefined) {
        handleMoveToEdit = () => {
            props.handleMoveToEdit!(explanation.task, explanation.edit_hierarchy);
        }
    }
    let handleMoveToTaskEditor = undefined;
    if (props.handleMoveToTaskEditor != undefined) {
        handleMoveToTaskEditor = () => {
            props.handleMoveToTaskEditor!(explanation.task, true);
        }
    }
    const handleMoveDisplayIndexRight = () => {
        setRightDisplayIndex(modulus((rightDisplayIndex + 1), numDisplays));
    } 
    const handleMoveDisplayIndexLeft = () => {
        setRightDisplayIndex(modulus((rightDisplayIndex - 1), numDisplays));
    }
    const handleSubmitExplanation = () => {
        if (explanation.task.taskId === undefined) {
            console.error("Task ID is undefined");
            return;
        }
        const sentExplanation = structuredClone(explanation);
        sentExplanation.sample_name = undefined;
        postExplanation(sentExplanation).then(() => {
            setSubmitted(true);
            incrementCurrentLevel(explanation.task.taskId!);
        }).catch((err) => {
            console.error(err);
        });
    }
    
    let rightDisplayTitle;
    switch (rightDisplayIndex) {
        case 0: rightDisplayTitle = "Attribution Value By Group"; break;
        case 1: rightDisplayTitle = "Top Model Responses"; break;
        case 2: rightDisplayTitle = "Task Description"; break;
        case 3: rightDisplayTitle = "Additional Information"; break;
        default: rightDisplayTitle = "This should not be reachable"; break;
    }
    return (
        <div className="flex flex-col my-1 gap-2 h-fit relative p-2 border-2 border-neutral-600 rounded-lg bg-white">
            {!inComparisonStudy && !props.suppressEvaluationDirectionWarning && !props.suppressEvaluationDirectionWarning && props.commonEvaluationDirection !== props.explanation.direction && <div className="text-slate-600 text-sm">This sample is not shown in the evaluation above, because it has a conflicting evaluation direction.</div>}
            <div className="flex flex-row gap-1 justify-between w-full h-fit">
                    <AttributedText
                    key={props.sampleIndex}
                    sampleIndex={props.sampleIndex}
                    explanation={explanation}
                    spans={spans}
                    groupSchedules={groupSchedules}
                    submissionSucceeded={submitted}
                    hideName={props.hideName}
                    handleRemoveSample={props.handleRemoveSample}
                    handleMoveToEdit={handleMoveToEdit}
                    handleMoveToTaskEditor={handleMoveToTaskEditor}
                    handleSubmission={handleSubmitExplanation}/>
                <div className={'w-1/2 flex flex-col mt-1'}>
                    <div className="flex flex-row gap-1 justify-center items-center">
                        <button onClick={handleMoveDisplayIndexLeft} className=""><BiLeftArrowCircle size={moveIconSize} /></button>
                        <p className="font-bold text-xl">{rightDisplayTitle}</p>
                        <button onClick={handleMoveDisplayIndexRight} className=""><BiRightArrowCircle size={moveIconSize} /></button>
                    </div>
                    {rightDisplayIndex == 0 && <AttributionChart explanation={explanation}/>}
                    {rightDisplayIndex == 1 && <ResponseDisplay modelResponses={explanation.task.originalPrediction} />}
                    {rightDisplayIndex == 2 && <TaskDescription task={explanation.task}/>}
                    {rightDisplayIndex == 3 && <ExecutionInfo executionTime={execution_time} nSamplesGenerated={n_samples_generated} model={explanation.model_to_explain} />}
                </div>
                
            </div>
        </div>
        
    );


    

}
export default SampleDisplay