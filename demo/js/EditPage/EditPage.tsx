import React, {useState } from "react";
import "../output.css";
import { AssignmentDisplayType } from "../datatypes/settings";
import { getSettings } from "../services/settings";
import { findSentenceEnds,scheduleGroupsPresentInSpan, collectGroups } from "../services/GroupedTextUtils";
import { initializeTree,addNode,deriveAssignments, moveLeavesUp, moveLeavesDown, moveLeavesSideways,deriveMovementOptions,deriveMovementOptionsForSelected } from "../services/tree";
import { Tree,Node} from "../datatypes/tree";
import { Task } from "../datatypes/network";
import EditableText from "./EditableText";
import SendBox from "./SendBox";
import GroupDisplay from "./GroupDisplay";
import EditGuidance from "./EditGuidance";
import Button from "../auxiliary/Button";
import {recreateTree, deepTreeCopy} from "../services/tree";
interface EditPageProps {
    task: Task;
    handleSend: (assignments: number[], direction:string, sampleName:string | null) => void;
    existingEditHierarchy?: Tree;
}
const EditPage = (props:EditPageProps) => {
    let task = props.task;
    let inputSegments = task.inputSegments;
    // Define the base hierarchy even if have existing hierarchy to allow for clear
    let baseHierarchy = initializeTree(inputSegments.length);
    let sentenceEnds = findSentenceEnds(inputSegments);
    let sentences = []
    let curIndex = 0;
    for (let i = 0; i < sentenceEnds.length; i++) {
        sentences.push(Array.from(new Array(sentenceEnds[i]-curIndex+1), (_, i) => i + curIndex))
        curIndex = sentenceEnds[i]+1;
    }
    for (let i = 0; i < sentences.length; i++) {
        addNode(baseHierarchy,baseHierarchy.root, sentences[i]);
    }
    let initialHierarchy = baseHierarchy;
    if (props.existingEditHierarchy !== undefined) {
        initialHierarchy = props.existingEditHierarchy;
    } 
    
   
    const [currentHierarchy, setCurrentHierarchy] = useState<Tree>(initialHierarchy);
    const [saveBuffer, setSaveBuffer] = useState<Tree[]>([]);
    let editableHierarchy =  {...currentHierarchy};
    let assignments = deriveAssignments(currentHierarchy);
    let collectedGroups = collectGroups(inputSegments, assignments);
    let moveOptions = deriveMovementOptions(currentHierarchy);
    let spans:number[][] = [];
    let groupSchedules:number[][] = [];
    let displaySettings = getSettings();
    if (displaySettings.assignmentDisplayType === AssignmentDisplayType.LINECONNECTOR){
        let schedulingValues = scheduleGroupsPresentInSpan(assignments);
        spans = schedulingValues[0];
        groupSchedules = schedulingValues[1];
    }
    const getMoveOptionsForSelected = (selectedSegmentIds:number[]) => {
        return deriveMovementOptionsForSelected(editableHierarchy, selectedSegmentIds);

    }
    const handleClickAssignment = (segmentId:number,clickedGroupId: number) => {
        console.log("Assign ",segmentId, " to ", clickedGroupId);
    } 
    const handleGoUp = (segmentIds:number[]) => {
        moveLeavesUp(editableHierarchy, segmentIds);
        setCurrentHierarchy(editableHierarchy);
    }
    const handleGoDown = (segmentIds:number[]) => {
        moveLeavesDown(editableHierarchy, segmentIds);
        setCurrentHierarchy(editableHierarchy);
    }
    const handleGoSideways = (segmentIds:number[], direction: boolean) => {
        moveLeavesSideways(editableHierarchy, segmentIds, direction);
        setCurrentHierarchy(editableHierarchy);
    }
    const handleClear = () => {
        setCurrentHierarchy(baseHierarchy );
    }
    const handleSendViaSendBox = (direction:string, sampleName: string | null) => {
        props.handleSend(assignments, direction, sampleName);
    }
    const handleSave = () => {
        // Perform a deep copy of the current hierarchy
        let currentHistorySnapshot = structuredClone(currentHierarchy);
        setSaveBuffer([...saveBuffer, currentHistorySnapshot]);
    }
    const handleUndo = () => {
        if (saveBuffer.length > 0) {
            let newBuffer = [...saveBuffer];
            let last = newBuffer.pop();
            setCurrentHierarchy(last as Tree);
            setSaveBuffer(newBuffer);
        }
    }
    const handleApplyPreset = () => {
        if (task.predefinedEditHierarchy !== undefined) {
            // Create a deep copy of the predefined hierarchy and set it as the current hierarchy
            // If do not perform the deep copy end up modifying the predefined hierarchy
            console.log(task.predefinedEditHierarchy);
            let separatedEditHierarchy = deepTreeCopy(task.predefinedEditHierarchy);
            // Problem is that task contains pointer to the preset leading to cyclic references errors
            let newCurrentHierarchy = recreateTree(separatedEditHierarchy);
            setCurrentHierarchy(newCurrentHierarchy);
        }
    }
    return (
        <div className="flex flex-col gap-1 w-full items-center ">
            <EditGuidance/>
            <div className="flex flex-row gap-3 mt-5 items-start w-full justify-center ">
                <div className="flex flex-col gap-2 items-center w-full">
                    <EditableText inputSegments={inputSegments} assignments={assignments}
                    spans={spans} groupSchedules={groupSchedules} moveOptions={moveOptions}
                    getMoveOptionsForSelected={getMoveOptionsForSelected}
                    handleClickAssignment={handleClickAssignment}
                    handleGoUp={handleGoUp}
                    handleGoDown={handleGoDown}
                    handleGoSideways={handleGoSideways}
                    handleClear={handleClear}
                    handleSave={handleSave}
                    handleUndo={saveBuffer.length > 0 ? handleUndo : undefined}
                    />
                </div>
                <div className="w-1/5 flex flex-col gap-2 items-center border-2 border-black rounded-lg px-2 pb-2" >
                    {task.predefinedEditHierarchy && <Button onClick={handleApplyPreset} order={2} >Apply Preset</Button>}
                    <hr />
                    <SendBox handleSend={handleSendViaSendBox}/>
                </div>
            </div>

            

        </div>
        
    );
}
export default EditPage;