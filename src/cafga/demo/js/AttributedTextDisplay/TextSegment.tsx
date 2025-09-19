import React from "react";
import { LineCommands } from "../datatypes/network";
import { getHighlightColour, getAttributionColour } from "../services/color";
import AssignmentDisplay from "./AssignmentDisplay";
import "../output.css";
// import MovementButtons from "../auxiliary/MovementButtons";
interface SegmentProps {
    innerRef?:any;
    onMouseDown?: (event: React.MouseEvent<HTMLDivElement>) => void;
    text: string;
    selfId: number;
    groupId: number;
    attribution: number | null;
    isHighlighted: boolean;
    isSelected: boolean;
    isLast: boolean;
    lineCommands: LineCommands;
    placeSymbol: boolean;
    disableButtons?: boolean;
    handleMouseEnter: (groupId: number) => void;
    handleMouseLeave: () => void;
    handleClick?: (event: React.MouseEvent<HTMLDivElement>,selfId:number,groupId: number) => void;
}
const AttributedTextSegment = (props: SegmentProps) => {
    const moveIconSize = 18;
    let isHighlighted = props.isHighlighted;
    let isSelected = props.isSelected;
    let attribution = props.attribution;
    const getColour = () => {
        if (isSelected) {
            // return 'hsla(39 76% 56% / 0.7)';
            return 'rgba(0 100 255 / 0.6)';

        } else if (isHighlighted) {
            return getHighlightColour(attribution === null);
        } else if (attribution === null ){
            return ''
        }
        return getAttributionColour(attribution);
    }
    // let isPunctuation = props.text.match(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g) ? true : false;
    let grow = props.isLast ? "": "flex-grow" ;

    return (
        <div ref={props.innerRef} className={`flex flex-col rounded ${grow} `}
        onMouseEnter={() => props.handleMouseEnter(props.groupId)} onMouseLeave={props.handleMouseLeave}
        // onClick={(event: React.MouseEvent<HTMLDivElement>,) => props.handleClick(event, props.selfId, props.groupId)}
        onMouseDown={props.onMouseDown}
        >
            <span className="rounded select-none text-lg text-black" style={{ backgroundColor: getColour()}} >
                {props.text}
            </span>
            <AssignmentDisplay groupId={props.groupId} lineCommands={props.lineCommands} segmentLength={props.text.length} placeSymbol={props.placeSymbol}/>
        </div>
        
    );
}
export default AttributedTextSegment