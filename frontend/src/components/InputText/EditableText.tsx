import { useState, useEffect, useCallback, useRef } from "react";
import { IoInformation } from "react-icons/io5";
import { DisplaySettings } from "../../datatypes/settings";
import { SelectionContext, Selectable } from "../auxiliary/rectangleSelection";
import {findMidPoints, deriveLineCommands} from "../../services/GroupedTextUtils";
import TextSegment from "./TextSegment";
import MovementButtons from "../auxiliary/MovementButtons";
import Button from "../auxiliary/Button";
interface EditableTextProps {
    inputSegments: string[];
    assignments: number[];
    spans: number[][];
    groupSchedules: number[][];
    moveOptions: boolean[][];
    displaySettings: DisplaySettings;
    getMoveOptionsForSelected: (selected:number[]) => boolean[];
    handleGoSideways: (segmentIds: number[], direction: boolean) => void;
    handleGoUp: (segmentIds: number[]) => void;
    handleGoDown: (segmentIds: number[]) => void;
    handleExitEditPage: (isSave: boolean) => void;
    handleClear: () => void;
    handleSave: () => void;
    handleUndo?: () => void;
    handleShowGuidance: () => void;
}
const EditableText = (props:EditableTextProps) => {
    const refedInputSegments = useRef(props.inputSegments);
    const inputSegments = refedInputSegments.current;
    const assignments = props.assignments;
    const displaySettings = props.displaySettings;

    const [highlightedGroup, setHighlightedGroup] = useState<number | null>(null);
    const [selected, setSelected] = useState<number[]>([]);
    const [hideMoveBar, setHideMoveBar] = useState<boolean>(false);
    const [groupMoveBarCoords, setGroupMoveBarCoords] = useState<number[]|null>(null);
    const textSegmentRefs = useRef<(HTMLDivElement | null)[]>([]);
    const editBoxRef = useRef<HTMLDivElement>(null);
    const moveIconSize = 12;

    // Handlers for text segments:
    const handleMouseEnter = (groupId: number) => {
        if (selected.length === 0) {
            setHighlightedGroup(groupId);
        }
    }
    const handleMouseLeave = () => {
        setHighlightedGroup(null);
    }
    const handleExitEditMode = (isSave:boolean) => {
        setSelected([]);
        props.handleExitEditPage(isSave);
    }
    const handleClear = () => {
        setSelected([]);
        props.handleClear();
    }
    // Handlers for group movement:
    let visibilityArray = [false, false, false, false];
    if (selected.length > 0) {
        visibilityArray = props.getMoveOptionsForSelected(selected);  
    }
    const handleGoLeftGroup = () => {
        props.handleGoSideways(selected, false);
    }
    const handleGoUpGroup = () => {
        props.handleGoUp(selected);
    }
    const handleGoDownGroup = () => {
        props.handleGoDown(selected);
    }
    const handleGoRightGroup = () => {
        props.handleGoSideways(selected, true);
    }
    const onMouseDown = useCallback((e: React.MouseEvent) => {
        const keyHeld = e.ctrlKey || e.altKey || e.shiftKey;
        if (!keyHeld) {
            setSelected([]);
            setGroupMoveBarCoords(null);
        }
      }, []);
    
    // This function is called when the brush was used to select a group of items.
    const onSelection = useCallback((items: [number[],HTMLElement[]]) => {
        const [selectedItems, _] = items;
        if (selectedItems.length > 0) {
            setSelected(selectedItems);
        }
        
    }, []);
    

    const onItemMouseDown = (id: number) => (e: React.MouseEvent) => {
        const keyHeld = e.ctrlKey || e.altKey || e.shiftKey;
        if (keyHeld && selected.length > 0) {
            const newSelected = [...selected, id];
            newSelected.sort((a, b) => a - b);
            setSelected(newSelected);
        } else {
            if (selected.includes(id)) {
                const groupOfId = assignments[id];
                const allIds = Array.from({ length: inputSegments.length }, (_, i) => i);
                setSelected(allIds.filter((selectedId) => assignments[selectedId] == groupOfId));
            } else {
                setSelected([id]);
            }
        }
        console.log("Already selected: ", selected);
        e.stopPropagation();
    };
    const computeGroupMoveBarCoords = () => {
        if (selected.length > 0) {
            // First find items on lowest level 
            let highestPoint = -Infinity;
            for (let i = 0; i < selected.length; i++) {
                const index = selected[i];
                if (textSegmentRefs.current[index] == null) {
                    continue;
                }
                const height = textSegmentRefs.current[index].getBoundingClientRect().bottom;
                if (height > highestPoint) {
                    highestPoint = height;
                }
            }
            let leftMostPoint = Infinity;
            let rightMostPoint = -Infinity;
            let leftMostIndex = -1;
            let rightMostIndex = -1;
            for (let i = 0; i < selected.length; i++) {
                const index = selected[i];
                if (textSegmentRefs.current[index] == null || textSegmentRefs.current[index].getBoundingClientRect().bottom !== highestPoint) {
                    continue;
                }
                const left = textSegmentRefs.current[index].getBoundingClientRect().left;
                const right = textSegmentRefs.current[index].getBoundingClientRect().right;
                if (left < leftMostPoint) {
                    leftMostPoint = left;
                    leftMostIndex = index;
                }
                if (right > rightMostPoint) {
                    rightMostPoint = right;
                    rightMostIndex = index;
                }
            }
            if (leftMostIndex === -1 || rightMostIndex === -1) {
                console.error("Could not find leftmost or rightmost index");
                return;
            }
            const leftMostRef = textSegmentRefs.current[leftMostIndex];
            const rightMostRef = textSegmentRefs.current[rightMostIndex];
            if (leftMostRef === null || rightMostRef === null) {
                return;
            }
            const leftMostBox = leftMostRef.getBoundingClientRect();
            const rightMostBox = rightMostRef.getBoundingClientRect();
            let newMoveBarCoords = [leftMostBox.left, leftMostBox.bottom, rightMostBox.right];
            if (leftMostBox.top !== rightMostBox.top) {
                newMoveBarCoords = [leftMostBox.left, leftMostBox.bottom, leftMostBox.right];
            }
            const editBoxBottom = editBoxRef.current?.getBoundingClientRect().bottom;
            const editBoxTop = editBoxRef.current?.getBoundingClientRect().top;
            const exceedsBottom = editBoxBottom !== undefined && newMoveBarCoords[1] > editBoxBottom; // Don't add icons size bc would make buttons on last row disappear
            const exceedsTop = editBoxTop !== undefined && newMoveBarCoords[1] - moveIconSize < editBoxTop;
            if (!exceedsBottom && !exceedsTop) {
                setGroupMoveBarCoords(newMoveBarCoords);
                visibilityArray = props.getMoveOptionsForSelected(selected);
                setHideMoveBar(false);
            } else {
                setHideMoveBar(true);
            }
        }
    }
    useEffect(() => {
        // Need this to happen after onSelection so that the segments get updated based on the selection first.
        computeGroupMoveBarCoords();
    }, [selected]);
    
    const midPointBitMap = findMidPoints(inputSegments.map(((segment) => segment.length) ), assignments);
    let hasLineBreak = false;
    for (let i = 0; i < inputSegments.length-1; i++) {
        if (inputSegments[i].endsWith("\n")) {
            hasLineBreak = true;
            break;
        }
    }
    const justifyStyle = hasLineBreak ? "justify-start" : "justify-between";


    return (
        <>
            <div className="flex flex-col gap-2 border-4 rounded-lg border-neutral-600 p-2 h-fit w-full relative ">
                <div className="items-center flex flex-row gap-1"> 
                    <Button onClick={handleClear} order={4}>Clear</Button>
                    {props.handleUndo && <Button onClick={props.handleUndo} order={4}>Undo</Button>}
                </div>
                <div className="absolute top-2 right-2">
                    <Button onClick={props.handleShowGuidance} order={5} noTextPaddings={true}><IoInformation size={22} /></Button>
                </div>
                <SelectionContext
                // @ts-expect-error The library used here causes some errors but it works fine. Suppressing the error.
                onSelection={onSelection}
                onMouseDown={onMouseDown}
                >
                    <div ref={editBoxRef} className={`flex flex-row flex-wrap whitespace-pre-wrap ${justifyStyle} overflow-x-clip p-2 max-h-[65vh] no-scrollbar overflow-y-auto`} onScroll={computeGroupMoveBarCoords}>
                        {inputSegments.map((segment, index) => (
                            <Selectable key={index} data={index} >
                                {innerRef => 
                                    <>
                                        <div className={`flex ${index == inputSegments.length - 1 || hasLineBreak ? '': 'flex-grow'} my-1 h-fit`}
                                         ref={el => {
                                             // @ts-expect-error
                                            innerRef(el);
                                            textSegmentRefs.current[index] = el;
                                        }}
                                         onMouseDown={onItemMouseDown(index)} >
                                        <TextSegment
                                        innerRef={innerRef}
                                        onMouseDown={onItemMouseDown(index)}
                                        key={index*3}
                                        text={segment}
                                        selfId={index}
                                        groupId={assignments[index]}
                                        attribution={null}
                                        isLast={index === inputSegments.length - 1}
                                        lineCommands={deriveLineCommands(index, assignments, displaySettings.assignmentDisplayType, props.spans, props.groupSchedules)}
                                        assignmentDisplayType={displaySettings.assignmentDisplayType}
                                        placeSymbol={midPointBitMap[index]}
                                        isHighlighted={highlightedGroup === assignments[index]}
                                        isSelected={selected.indexOf(index) !== -1 }
                                        disableButtons={true}
                                        handleMouseEnter={handleMouseEnter} handleMouseLeave={handleMouseLeave}
                                        />
                                        </div>
                                        {segment.endsWith("\n") && <div key={index*3+1}className="w-full flex-grow invisible h-0"> </div>}
                                        {segment.includes("\n\n") && <div key={index*3+2} className="w-full flex-grow h-5 invisible"> </div>}
                                    </>
                                }
                            </Selectable>
                        ))}
                        {/*This spacer element fills up the space on the last line. Temp solution*/ }
                        <div className="flex-grow basis-1/2"></div>
                        
                    </div>
                </SelectionContext>
                <div className="flex flex-row justify-between ">
                    <Button onClick={() => handleExitEditMode(false)} order={3}>
                        Exit
                    </Button>
                    <Button onClick={props.handleSave} order={1}>
                        Save
                    </Button>

                </div>
                    
            </div>
            {groupMoveBarCoords && !hideMoveBar && (
            <div
                className="absolute  flex flex-row justify-center"
                style={{
                    left: groupMoveBarCoords[0],
                    top: groupMoveBarCoords[1] ,
                    width: groupMoveBarCoords[2] - groupMoveBarCoords[0],
                }}
                
            >
                <MovementButtons
                    moveIconSize={moveIconSize}
                    visibilityArray={visibilityArray}
                    handleGoLeft={handleGoLeftGroup}
                    handleGoUp={handleGoUpGroup}
                    handleGoDown={handleGoDownGroup}
                    handleGoRight={handleGoRightGroup}
                />
            </div>
            )}
        </>

            
            
        
    );


    

}
export default EditableText