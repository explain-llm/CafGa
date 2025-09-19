import React, { useState } from "react";
import "../output.css";
import { GroupAttributionResponse, LineCommands } from "../datatypes/network"
import {findMidPoints,addSpaceAfterPeriods} from "../services/GroupedTextUtils";
import { getAttributionColour, sampleColorTable } from "../services/color";
import ColorGradient from "./ColorGradient";
import TextSegment from "./TextSegment";
interface InputTextProps {
    sampleIndex: number;
    groupAttributions: GroupAttributionResponse;
    spans: number[][];
    groupSchedules: number[][];
}
// This component displays the input text once the attributions have been loaded.
const AttributedText = (props:InputTextProps) => {
     // TODO: 1. Get rid of edit mode relics and make "edit mode button" redirect to EditPage: DONE
     //2. Move span calculation to sampleDisplay and pass it as a prop
    let groupAttributions = props.groupAttributions;
    let inputSegments = groupAttributions.task.inputSegments;
    let attributions = groupAttributions.attributions;
    let assignments = groupAttributions.group_assignments;

    const [highlightedGroup, setHighlightedGroup] = useState<number | null>(null);

    const handleMouseEnter = (groupId: number) => {
        setHighlightedGroup(groupId);
    }
    const handleMouseLeave = () => {
        setHighlightedGroup(null);
    }
    
    const deriveLineCommands = (index: number):LineCommands => {
        let isFirst = index == 0;
        let isLast = index == inputSegments.length - 1;
        let breakLeft = false;
        let breakRight = false;
        let groupSchedule:number[] = [];
        breakLeft = props.spans[assignments[index]][0] === index;
        breakRight = props.spans[assignments[index]][1] === index;
        groupSchedule = props.groupSchedules[index];
        
        let lineCommands:LineCommands = {isFirst, isLast, breakLeft, breakRight, groupSchedule};
        return lineCommands;
    }
    let midPointBitMap = findMidPoints(inputSegments.map(((segment) => segment.length) ), assignments);
    let negativeColour = getAttributionColour(-1);
    let negativeHalfway = getAttributionColour(-0.5);
    let positiveHalfway = getAttributionColour(0.5);
    let positiveColour = getAttributionColour(1);
    const sampleName = groupAttributions.sample_name ? groupAttributions.sample_name : "Sample " + (props.sampleIndex + 1);
    return (
            <div className="flex flex-col gap-3 rounded-lg border-neutral-600 p-1 h-full relative justify-between items-start w-full">
                
            <p className="font-bold text-xl " style={{ color: sampleColorTable[props.sampleIndex] }}>{sampleName}</p>
                    <div className="flex flex-row flex-wrap whitespace-pre-wrap justify-between ">
                        {inputSegments.map((segment, index) => (
                            <TextSegment key={index} 
                            text={addSpaceAfterPeriods(segment)}
                            selfId={index} 
                            groupId={assignments[index]} 
                            attribution={attributions[assignments[index]]}
                            isLast={index === inputSegments.length - 1}
                            lineCommands={deriveLineCommands(index)} 
                            placeSymbol={midPointBitMap[index]}
                            isHighlighted={highlightedGroup === assignments[index]} 
                            isSelected={false }
                            disableButtons={true}
                            handleMouseEnter={handleMouseEnter} handleMouseLeave={handleMouseLeave}
                            />
                            
                        ))}
                        {/*This spacer element fills up the space on the last line.*/ }
                        <div className="flex-grow basis-2/3"></div>
                    </div>
                <div className="flex flex-row justify-between items-center -ml-1">
                    <ColorGradient negative={negativeColour} negativeHalfway={negativeHalfway} positiveHalfway={positiveHalfway} positive={positiveColour} />
                </div>
                    
            </div>

            
            
        
    );


    

}
export default AttributedText