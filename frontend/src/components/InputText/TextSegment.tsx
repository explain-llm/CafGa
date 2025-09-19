import { LineCommands } from "../../datatypes/network";
import { AssignmentDisplayType } from "../../datatypes/settings";
import { getHighlightColour, getAttributionColour } from "../../services/color";
import AssignmentDisplay from "./AssignmentDisplay";
import MovementButtons from "../auxiliary/MovementButtons";
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
    assignmentDisplayType: AssignmentDisplayType;
    placeSymbol: boolean;
    disableButtons?: boolean;
    disableGrow?: boolean;
    handleMouseEnter: (groupId: number) => void;
    handleMouseLeave: () => void;
    handleClick?: (event: React.MouseEvent<HTMLDivElement>,selfId:number,groupId: number) => void;
    handleGoLeft?: (selfId: number) => void;
    handleGoUp?: (selfId: number) => void;
    handleGoDown?: (selfId: number) => void;
    handleGoRight?: (selfId: number) => void;
}
const AttributedTextSegment = (props: SegmentProps) => {
    const moveIconSize = 18;
    const isHighlighted = props.isHighlighted;
    const isSelected = props.isSelected;
    const attribution = props.attribution;
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
    const endsWithLineBreak = props.text.includes("\n");
    // if (props.text.includes("\n")) {
    //     console.log("line break found in text: ", props.text);
    // }
    const grow = props.isLast || props.disableGrow ? "": "flex-grow" ;
    const visibilityArray =  [props.handleGoLeft !== undefined, props.handleGoUp !== undefined, props.handleGoDown !== undefined, props.handleGoRight !== undefined];
    const handleGoLeft = () => {
        props.handleGoLeft?.(props.selfId);
    }
    const handleGoUp = () => {
        props.handleGoUp?.(props.selfId);
    }
    const handleGoDown = () => {
        props.handleGoDown?.(props.selfId);
    }
    const handleGoRight = () => {
        props.handleGoRight?.(props.selfId);
    }
    let borderFormatting = " ";
    const lineCommands = props.lineCommands;
    if (lineCommands.interruptLeft) {
        borderFormatting += "rounded-l-md";
    }
    if (lineCommands.interruptRight) {
        borderFormatting += " rounded-r-md";
    }
    if (lineCommands.interruptLeft && attribution !== null) {
        borderFormatting += " pl-1";
    }
    if (lineCommands.interruptRight && attribution !== null){
        borderFormatting += " pr-1";
    }
    if (isSelected) {
        borderFormatting = "rounded-md "
    }
    const displayText = endsWithLineBreak ? props.text.trimEnd() : props.text;
    return (
        <div ref={props.innerRef} className={`flex flex-col  ${grow} `}
        onMouseEnter={() => props.handleMouseEnter(props.groupId)} onMouseLeave={props.handleMouseLeave}
        // onClick={(event: React.MouseEvent<HTMLDivElement>,) => props.handleClick(event, props.selfId, props.groupId)}
        onMouseDown={props.onMouseDown}
        >
            <span className={`select-none ${borderFormatting}`} style={{ backgroundColor: getColour()}} >
                {displayText}
            </span>
            <AssignmentDisplay groupId={props.groupId} assignmentDisplayType={props.assignmentDisplayType} lineCommands={props.lineCommands} segmentLength={props.text.length} placeSymbol={props.placeSymbol}/>
            {!props.disableButtons && <MovementButtons moveIconSize={moveIconSize} visibilityArray={visibilityArray}
            handleGoLeft={handleGoLeft}
            handleGoUp={handleGoUp}
            handleGoDown={handleGoDown}
            handleGoRight={handleGoRight} />}
        </div>
        
    );
}
export default AttributedTextSegment