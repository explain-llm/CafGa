import { useState, useEffect } from "react";
import { AssignmentDisplayType, AssignmentPreset } from "../../datatypes/settings";
import { getEnumOptions, getSettings } from "../../services/settings";
import {scheduleGroupsPresentInSpan, collectGroups } from "../../services/GroupedTextUtils";
import { initializeTree,addNode,deriveAssignments, moveLeavesUp, moveLeavesDown, moveLeavesSideways,deriveMovementOptions,deriveMovementOptionsForSelected,
    getWordAssignments,
    getSentenceAssignments,
    getParagraphAssignments,
 } from "../../services/tree";
import { Tree,Node} from "../../datatypes/tree";
import { Task } from "../../datatypes/network";
import EditableText from "../InputText/EditableText";
import SendBox from "./SendBox";
import GroupDisplay from "./GroupDisplay";
import EditGuidance from "./EditGuidance";
import ExtendedEditGuidance from "./ExtendedEditGuidance";
import Button from "../auxiliary/Button";
import DropDownSelect from "../auxiliary/DropDownSelect";
import WithLabel from "../auxiliary/WithLabel";
// import {recreateTree, deepTreeCopy} from "../../services/tree";
interface EditPageProps {
    task: Task;
    handleCancel: () => void;
    handleSend: (task: Task, assignments: number[], direction:string, editHierarchy:Node, sampleName:string | null) => void;
    handleMoveToTaskEditor: (task : Task, fromSampleDisplay? : boolean) => void;
    existingEditHierarchy?: Tree;
}
const EditPage = (props:EditPageProps) => {
    const task = props.task;
    const inputSegments = task.inputSegments;
    // Define the base hierarchy even if have existing hierarchy to allow for clear
    const baseHierarchy = initializeTree(inputSegments.length);
    addNode(baseHierarchy, baseHierarchy.root, Array.from({ length: inputSegments.length }, (_, i) => i));
    let initialHierarchy = baseHierarchy;
    if (props.existingEditHierarchy !== undefined) {
        initialHierarchy = props.existingEditHierarchy;
    } 
    // const isValidPreset = (task.predefinedEditHierarchy !== undefined && task.predefinedEditHierarchy !== null && task.predefinedEditHierarchy.children.length > 0);
    const [currentPreset, setCurrentPreset] = useState<AssignmentPreset>(AssignmentPreset.NONE);
    const [currentHierarchy, setCurrentHierarchy] = useState<Tree>(initialHierarchy);
    const [extendedGuidanceShown, setExtendedGuidanceShown] = useState<boolean>(false);
    const [saveBuffer, setSaveBuffer] = useState<Tree[]>([]);
    const [numGroups, setNumGroups] = useState<number>(0);
    const editableHierarchy =  {...currentHierarchy};
    const assignments = deriveAssignments(currentHierarchy);
    const collectedGroups = collectGroups(inputSegments, assignments);

    const moveOptions = deriveMovementOptions(currentHierarchy);
    let spans:number[][] = [];
    let groupSchedules:number[][] = [];
    const displaySettings = getSettings();

    useEffect(() => {
        setNumGroups(collectedGroups.length);
    }, [collectedGroups]);
    useEffect(() => {
        if (props.existingEditHierarchy !== undefined) {
            setCurrentHierarchy(props.existingEditHierarchy);
        } 
    }, [props.existingEditHierarchy]);
    if (displaySettings.assignmentDisplayType === AssignmentDisplayType.LINECONNECTOR){
        const schedulingValues = scheduleGroupsPresentInSpan(assignments);
        spans = schedulingValues[0];
        groupSchedules = schedulingValues[1];
    }
    const getMoveOptionsForSelected = (selectedSegmentIds:number[]) => {
        return deriveMovementOptionsForSelected(editableHierarchy, selectedSegmentIds);

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
    const handleExitEditPage = () => {
        props.handleCancel();
    }
    const handleClear = () => {
        setCurrentHierarchy(baseHierarchy );
    }
    const handleSendViaSendBox = (direction:string, sampleName: string | null) => {
        props.handleSend(task, assignments, direction, currentHierarchy.root, sampleName);
    }
    const handleSave = () => {
        // Perform a deep copy of the current hierarchy
        const currentHistorySnapshot = structuredClone(currentHierarchy);
        setSaveBuffer([...saveBuffer, currentHistorySnapshot]);
    }
    const handleUndo = () => {
        if (saveBuffer.length > 0) {
            const newBuffer = [...saveBuffer];
            const last = newBuffer.pop();
            setCurrentHierarchy(last as Tree);
            setSaveBuffer(newBuffer);
        }
    }
    const handleApplyPreset = (presetString : string) => {
        const preset = presetString as AssignmentPreset;
        setCurrentPreset(preset);
        switch (preset) {
            case AssignmentPreset.NONE:
                setCurrentHierarchy(baseHierarchy);
                break;
            case AssignmentPreset.WORD:
                setCurrentHierarchy(getWordAssignments(inputSegments));
                break;
            case AssignmentPreset.SENTENCE:
                setCurrentHierarchy(getSentenceAssignments(inputSegments));
                break;
            case AssignmentPreset.PARAGRAPH:
                setCurrentHierarchy(getParagraphAssignments(inputSegments));
                break;
            // Not available in the current version
            // case AssignmentPreset.SYNTAX-TREE: 
            //     if (isValidPreset) {
            // if (task.predefinedEditHierarchy !== undefined) {
            //     const separatedEditHierarchy = deepTreeCopy(task.predefinedEditHierarchy);
            //     const newCurrentHierarchy = recreateTree(separatedEditHierarchy);
            //     setCurrentHierarchy(newCurrentHierarchy);
            // }
            //         setCurrentHierarchy(recreateTree(task.predefinedEditHierarchy));
            //     }
            //     break;
            default:
                break;
        }
        
    }
    return (
        <div className="flex flex-col gap-1 w-full items-center h-svh  no-scrollbar">
            
            <EditGuidance/>
            <div className="flex flex-row gap-3 mt-5 items-start w-full justify-center ">

                <div className="w-52 min-w-52 ">
                    <GroupDisplay groups={collectedGroups}/>
                </div>
                <div className="flex flex-col gap-2 items-center w-full ">
                    <EditableText inputSegments={inputSegments} assignments={assignments}
                    spans={spans} groupSchedules={groupSchedules} moveOptions={moveOptions}
                    displaySettings={displaySettings}
                    getMoveOptionsForSelected={getMoveOptionsForSelected}
                    handleGoUp={handleGoUp}
                    handleGoDown={handleGoDown}
                    handleGoSideways={handleGoSideways}
                    handleClear={handleClear}
                    handleExitEditPage={handleExitEditPage}
                    handleSave={handleSave}
                    handleShowGuidance={() => setExtendedGuidanceShown(true)}
                    handleUndo={saveBuffer.length > 0 ? handleUndo : undefined}
                    />
                </div>
                
                <div className="w-1/5 flex flex-col gap-1 items-center border-2 border-black rounded-lg p-2 " >
                    <Button onClick={() => props.handleMoveToTaskEditor(task, false)} order={2} >Task</Button>
                    <WithLabel label="Apply Preset" fillHeight={false}>
                        <DropDownSelect options={getEnumOptions(AssignmentPreset)} selectedKey={currentPreset} onChange={handleApplyPreset}  />
                    </WithLabel>
                    <hr />
                    <SendBox handleSend={handleSendViaSendBox} taskName={task.taskId !== "custom" ? task.taskId : undefined } numGroups={numGroups}/>
                </div>
            </div>
            <ExtendedEditGuidance isShown={extendedGuidanceShown} onClose={() => setExtendedGuidanceShown(false)} />

            

        </div>
        
    );
}
export default EditPage;