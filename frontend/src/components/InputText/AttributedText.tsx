import { useEffect, useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { FaCheck } from "react-icons/fa6";
import { Explanation } from "../../datatypes/network";
import { DisplaySettings } from "../../datatypes/settings";
import { getSettings, checkIsStudyP1, checkIsStudyP2 } from "../../services/settings";
import {findMidPoints, deriveLineCommands} from "../../services/GroupedTextUtils";
import { getAttributionColour, sampleColorTable } from "../../services/color";
import ColorGradient from "../auxiliary/ColorGradient";
import TextSegment from "./TextSegment";
import Button from "../auxiliary/Button";

interface InputTextProps {
    sampleIndex: number;
    explanation: Explanation;
    spans: number[][];
    groupSchedules: number[][];
    submissionSucceeded?: boolean;
    hideName?: boolean;
    handleRemoveSample?: () => void;
    handleMoveToEdit?: () => void;
    handleMoveToTaskEditor?: () => void;
    handleSubmission?: () => void;
}
// This component displays the input text once the attributions have been loaded.
const AttributedText = (props:InputTextProps) => {
    const inCreationStudy = checkIsStudyP1();
    const inComparisonStudy = checkIsStudyP2();
    const explanation = props.explanation;
    const inputSegments = explanation.task.inputSegments;
    const attributions = explanation.attributions;
    const assignments = explanation.group_assignments;
    const validTask = explanation.task.taskId !== undefined && explanation.task.taskId !== "Custom";
    let givenSampleName = explanation.sample_name && !props.hideName ? explanation.sample_name : "Explanation " + (props.sampleIndex + 1);
    givenSampleName = givenSampleName.replace(/_/g, " ");
    givenSampleName = givenSampleName[0].toUpperCase() + givenSampleName.slice(1);
    const [submissionLoading, setSubmissionLoading] = useState<boolean>(false);
    const [submissionSucceeded, setSubmissionSucceeded] = useState<boolean>(props.submissionSucceeded || false);
    const [isEditingName, setIsEditingName] = useState<boolean>(false);
    const [sampleName, setSampleName] = useState<string>(givenSampleName);

    useEffect(() => {
        setSampleName(givenSampleName);
    }
    , [givenSampleName]);
    useEffect(() => {
        if (props.submissionSucceeded != undefined) {
            setSubmissionSucceeded(props.submissionSucceeded);
            setSubmissionLoading(false);
        }
    }, [props.submissionSucceeded]);

    const [highlightedGroup, setHighlightedGroup] = useState<number | null>(null);
    const displaySettings : DisplaySettings = getSettings();
    const handleMouseEnter = (groupId: number) => {
        setHighlightedGroup(groupId);
    }
    const handleMouseLeave = () => {
        setHighlightedGroup(null);
    }
    const handleNameFieldClicked = () => {
        setIsEditingName(!inComparisonStudy);
    }
    const handleNameChange = (newName: string) => {
        explanation.sample_name = newName;
        setSampleName(newName);
        setIsEditingName(false);
    }
    const handleSubmission = () => {
        if (props.handleSubmission) {
            setSubmissionLoading(true);
            props.handleSubmission();
        }
    }
    const midPointBitMap = findMidPoints(inputSegments.map(((segment) => segment.length) ), assignments);
    const negativeColour = getAttributionColour(-1);
    const negativeHalfway = getAttributionColour(-0.5);
    const positiveHalfway = getAttributionColour(0.5);
    const positiveColour = getAttributionColour(1);
    for (let i = 0; i < inputSegments.length; i++) {
        if (attributions[assignments[i]] === undefined) {
            console.warn("Undefined attribution for group ", assignments[i]);
        }
    }
    let hasLineBreak = false;
    for (let i = 0; i < inputSegments.length - 1; i++) {
        if (inputSegments[i].endsWith("\n")) {
            hasLineBreak = true;
            break;
        }
    }
    const justifyStyle = hasLineBreak ? "justify-start" : "justify-between";
    const exitHandlesPresent = props.handleMoveToEdit != undefined && props.handleMoveToTaskEditor != undefined;
    return (
            <div className="flex flex-col gap-3 rounded-lg border-neutral-600 p-1 h-fill w-1/2 relative justify-between">
                {props.handleRemoveSample != undefined && <div className="absolute top-2 left-2"><Button onClick={() => props.handleRemoveSample!()} order={2} noTextPaddings={true}> <RxCross1 size={15}/></Button></div>}
            {inCreationStudy && validTask && 
                <div className="absolute top-1 right-2">
                    <Button onClick={handleSubmission} order={4} noTextPaddings={false}> 
                        Submit {submissionLoading && <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-900"/>} {submissionSucceeded && <FaCheck/>}
                    </Button>
                </div>}
                {!isEditingName && <p className="font-bold text-xl " style={{ color: sampleColorTable[props.sampleIndex] }} onClick={handleNameFieldClicked}>{sampleName}</p>}
                {isEditingName && <input className="font-bold text-xl w-fit self-center rounded-lg px-1" style={{ color: sampleColorTable[props.sampleIndex] }} value={sampleName} onChange={(e) => setSampleName(e.target.value)} onBlur={() => handleNameChange(sampleName)}></input>}
            <div className={`flex flex-row flex-wrap whitespace-pre-wrap ${justifyStyle} max-h-[25rem] overflow-y-auto`}>
                    {inputSegments.map((segment, index) => (
                        <>
                        <TextSegment key={index*3} 
                        text={segment}
                        selfId={index} 
                        groupId={assignments[index]} 
                        attribution={attributions[assignments[index]]}
                        isLast={index === inputSegments.length - 1}
                        lineCommands={deriveLineCommands(index, assignments, displaySettings.assignmentDisplayType, props.spans, props.groupSchedules)} 
                        assignmentDisplayType={displaySettings.assignmentDisplayType}
                        placeSymbol={midPointBitMap[index]}
                        isHighlighted={highlightedGroup === assignments[index]} 
                        isSelected={false }
                        disableGrow={hasLineBreak}
                        disableButtons={true}
                        handleMouseEnter={handleMouseEnter} handleMouseLeave={handleMouseLeave}
                        />
                        
                        { segment.includes("\n") && <div key={index*3+1} className="w-full flex-grow h-0 invisible"> </div> /*Should be endsWith but because might have space after newLine use includes */ }
                        { segment.endsWith("\n\n") && <div key={index*3+2}className="w-full flex-grow h-3 invisible"> </div> }
                        </>
                        
                    ))}
                    <div className="flex-grow basis-2/3"></div>
                </div>
                <div className="flex flex-row justify-between items-center -ml-1">
                {exitHandlesPresent &&
                    <div className="flex flex-row gap-1">
                        <Button onClick={() => props.handleMoveToEdit!()} order={4}>
                            Reassign
                        </Button>
                        <Button onClick={() => props.handleMoveToTaskEditor!()} order={4}>
                            Task
                        </Button>
                    </div>}
                    <ColorGradient negative={negativeColour} negativeHalfway={negativeHalfway} positiveHalfway={positiveHalfway} positive={positiveColour} />
                </div>
            </div>
    );
}
export default AttributedText