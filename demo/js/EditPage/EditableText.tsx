import React, { useState, useEffect, useCallback, useRef } from "react";
import '../output.css';
import { LineCommands } from "../datatypes/network";
import { SelectionContext, Selectable } from "../auxiliary/rectangleSelection";
import {findMidPoints,addSpaceAfterPeriods} from "../services/GroupedTextUtils";
import TextSegment from "../AttributedTextDisplay/TextSegment";
import MovementButtons from "../auxiliary/MovementButtons";
import Button from "../auxiliary/Button";
interface EditableTextProps {
    inputSegments: string[];
    assignments: number[];
    spans: number[][];
    groupSchedules: number[][];
    moveOptions: boolean[][];
    getMoveOptionsForSelected: (selected:number[]) => boolean[];
    handleClickAssignment: (segmentId: number, clickedGroupId: number) => void;
    handleGoSideways: (segmentIds: number[], direction: boolean) => void;
    handleGoUp: (segmentIds: number[]) => void;
    handleGoDown: (segmentIds: number[]) => void;
    handleClear: () => void;
    handleSave: () => void;
    handleUndo?: () => void;
}
const EditableText = (props:EditableTextProps) => {
    let refedInputSegments = useRef(props.inputSegments);
    let inputSegments = refedInputSegments.current;
    // let refSegments =  inputSegments.map((segment) => useRef<string>(segment));
    let assignments = props.assignments;

    const [highlightedGroup, setHighlightedGroup] = useState<number | null>(null);
    const [selected, setSelected] = useState<number[]>([]);
    const [groupMoveBarCoords, setGroupMoveBarCoords] = useState<number[]|null>(null);
    const textSegmentRefs = useRef<(HTMLDivElement | null)[]>([]);
    const selectionWindowRef = useRef<HTMLDivElement | null>(null);
    const moveIconSize = 12;

    
    let spans = props.spans;
    let groupSchedules = props.groupSchedules;

    // Handlers for text segments:

    const handleMouseEnter = (groupId: number) => {
        if (selected.length === 0) {
            setHighlightedGroup(groupId);
        }
    }
    const handleMouseLeave = () => {
        setHighlightedGroup(null);
    }
    const handleClear = () => {
        setSelected([]);
        props.handleClear();
    }
    const handleGoLeft = (selfId: number) => {
        props.handleGoSideways([selfId], false);
    }
    const handleGoUp = (selfId: number) => {
        props.handleGoUp([selfId]);
    }
    const handleGoDown = (selfId: number) => {
        props.handleGoDown([selfId]);
    }
    const handleGoRight = (selfId: number) => {
        props.handleGoSideways([selfId], true);
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
    const onMouseDown = useCallback(() => {
        setSelected([]);
        setGroupMoveBarCoords(null);
      }, []);
    
    // This function is called when the brush was used to select a group of items.
    const onSelection = useCallback((items: [number[],HTMLElement[]]) => {
        let [selectedItems, selectedItemRefs] = items;
        if (selectedItems.length === 0) {
            return;
        }
        let leftMostRef = selectedItemRefs[0]
        let leftMost = leftMostRef.getBoundingClientRect();
        let leftMostHeight = leftMost.top;
        // Find first element from right that has the same height as the leftmost element.
        let rightMostIndex = 0;
        for (let i = selectedItemRefs.length - 1; i >= 0; i--) {
            if (selectedItemRefs[i].getBoundingClientRect().top == leftMostHeight) {
                rightMostIndex = i;
                break;
            }
        }
        if (selectedItems.length > 0) {
            setSelected(selectedItems.slice(0, rightMostIndex + 1));
        }
        
    }, []);
    

    const onItemMouseDown = (id: number) => (e: React.MouseEvent) => {
        let keyHeld = e.ctrlKey || e.altKey || e.shiftKey;
        if (keyHeld && selected.length > 0) {
            let newSelected = [...selected, id];
            newSelected.sort((a, b) => a - b);
            setSelected(newSelected);
        } else {
            setSelected([id]);
        }
        e.stopPropagation();
    };
    useEffect(() => {
        // Need this to happen after onSelection so that the segments get updated based on the selection first.
        if (selected.length > 0) {
            let leftMostIndex = selected[0];
            let rightMostIndex = selected[selected.length - 1];
            let leftMostRef = textSegmentRefs.current[leftMostIndex];
            let rightMostRef = textSegmentRefs.current[rightMostIndex];
            if (leftMostRef === null || rightMostRef === null) {
                return;
            }
            let leftMostBox = leftMostRef.getBoundingClientRect();
            let rightMostBox = rightMostRef.getBoundingClientRect();
            let selectionWindowRect = selectionWindowRef.current!.getBoundingClientRect();
            let bottom = leftMostBox.bottom - selectionWindowRect.top;
            let left = leftMostBox.left - selectionWindowRect.left;
            let right = rightMostBox.right - selectionWindowRect.left;
            let newMoveBarCoords = [left, bottom, right];
            setGroupMoveBarCoords(newMoveBarCoords);
            visibilityArray = props.getMoveOptionsForSelected(selected);  
        }
    }, [selected]);
    
    const deriveLineCommands = (index: number):LineCommands => {
        let isFirst = index == 0;
        let isLast = index == inputSegments.length - 1;
        let breakLeft = false;
        let breakRight = false;
        let groupSchedule:number[] = [];
        breakLeft = spans[assignments[index]][0] === index;
        breakRight = spans[assignments[index]][1] === index;
        groupSchedule = groupSchedules[index];
        
        let lineCommands:LineCommands = {isFirst, isLast, breakLeft, breakRight, groupSchedule};
        return lineCommands;
    }
    let midPointBitMap = findMidPoints(inputSegments.map(((segment) => segment.length) ), assignments);

    return (
        <>
            <div className="flex flex-col gap-2 border-4 rounded-lg border-neutral-600 p-2 h-fit w-full relative">

                
                <div className="items-center flex flex-row gap-1"> 
                    <Button onClick={handleClear} order={4}>Clear</Button>
                    {props.handleUndo && <Button onClick={props.handleUndo} order={4}>Undo</Button>}
                </div>
                <SelectionContext
                // @ts-ignore The library used here causes some errors but it works fine. Suppressing the error.
                onSelection={onSelection}
                onMouseDown={onMouseDown}
                >
                    <div className="flex flex-row flex-wrap whitespace-pre-wrap justify-between p-2" ref={(el) => {
                        selectionWindowRef.current = el;
                        }
                    }>
                        {inputSegments.map((segment, index) => (
                            <Selectable key={index} data={index} >
                                {innerRef => 
                                     <div className={`${index == inputSegments.length-1 ? '': 'flex-grow'} mb-2 mt-2 h-fit`}  
                                     ref={el => {
                                        // @ts-ignore
                                        innerRef(el);
                                        textSegmentRefs.current[index] = el;
                                    }}
                                     onMouseDown={onItemMouseDown(index)}
                                   >
                                    <TextSegment
                                    innerRef={innerRef}
                                    onMouseDown={onItemMouseDown(index)}
                                    key={index}
                                    text={addSpaceAfterPeriods(segment)}
                                    selfId={index}
                                    groupId={assignments[index]}
                                    attribution={null}
                                    isLast={index === inputSegments.length - 1}
                                    lineCommands={deriveLineCommands(index)}
                                    placeSymbol={midPointBitMap[index]}
                                    isHighlighted={highlightedGroup === assignments[index]}
                                    isSelected={selected.indexOf(index) !== -1 }
                                    // disableButtons={selected.length != 1 ? true : selected[0] != index}
                                    disableButtons={true}
                                    handleMouseEnter={handleMouseEnter} handleMouseLeave={handleMouseLeave}
                                    handleGoLeft={props.moveOptions[index][0] ? handleGoLeft : undefined}
                                    handleGoUp={props.moveOptions[index][1] ? handleGoUp: undefined}
                                    handleGoDown={props.moveOptions[index][2] ? handleGoDown: undefined}
                                    handleGoRight={props.moveOptions[index][3] ? handleGoRight: undefined}
                                    />
                                </div>
                                }
                            </Selectable>
                        ))}
                        {/*This spacer element fills up the space on the last line. Temp solution*/ }
                        <div className="flex-grow basis-1/2"></div>
                        
                    </div>
                </SelectionContext>
                <div className="flex flex-row justify-between ">
                    <Button onClick={props.handleSave} order={1}>
                        Save
                    </Button>

                </div>
                    
            </div>
            {groupMoveBarCoords && (
            <div
                className="absolute flex flex-row justify-center"
                style={{
                    left: groupMoveBarCoords[0]+10,
                    top: groupMoveBarCoords[1]+108 ,
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