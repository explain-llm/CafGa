import { AssignmentDisplayType } from "../../datatypes/settings";
import { LineCommands } from "../../datatypes/network";
const LineThicknessFactor = 1;
const LineHeightFactor = 2;
const glyphSize = 30;
const glyphArray = ["𓋹","𓏢 ","𓍰","𓄍","𓌅","𓎴","𓇍","𓂀","𓂖","𓅉","𓀫","𓇵", "𓀓","𓃘"] 
const GlyphTable = (groupId:number) => {
        return (
            <div className="font-semibold"style={{ fontFamily: 'Aegyptus', fontSize: `${glyphSize}px` }}>
            {groupId < glyphArray.length ? glyphArray[groupId] : <>&nbsp;</>}	
            </div>
        );
}
interface AssignmentDisplayProps {
    groupId: number;
    assignmentDisplayType: AssignmentDisplayType;
    lineCommands: LineCommands;
    segmentLength: number;
    placeSymbol: boolean;
}
const LineThicknessDisplay = (props: AssignmentDisplayProps) => {
    const lineCommands = props.lineCommands;
    const offset = props.segmentLength == 1 ? 0.5 : 1;
    const deriveLineBreaks= () => {
        let marginText = ""
        if (lineCommands.breakLeft){
            marginText += `ml-${offset}`;
        }
        if (lineCommands.breakRight){
            marginText += ` mr-${offset}`;
        }
        return marginText;
    }
    return (
        <hr className={`${deriveLineBreaks()} mt-0.5 `} style={{ borderTop: `${LineThicknessFactor*props.groupId+2}px solid black`}} />
    );
}
const LineHeightDisplay = (props: AssignmentDisplayProps) => {
    const lineCommands = props.lineCommands;
    const deriveLineBreaks= () => {
        let marginText = ""
        if (lineCommands.breakLeft){
            marginText += "ml-0.5"
        }
        if (lineCommands.breakRight){
            marginText += " mr-0.5"
        }
        return marginText;
    }
    return (
        <hr className={`${deriveLineBreaks()} mb-0.5 mt-0.5  `} style={{ borderTop: '2px solid black', marginTop : `${LineHeightFactor*props.groupId+1}px`}} />
    );
}
const LineConnectorDisplay = (props: AssignmentDisplayProps) => {
    const lineCommands = props.lineCommands;
    const groupSchedule = lineCommands.groupSchedule;

    const dashLength = 2; // Length of each dash
    const dashSpacing = 2 ; // Space between dashes

    const getLineBreaks= (withRounding:boolean) => {
        let breakText = "";
        if (lineCommands.breakLeft){
            breakText += " ml-1"
            if (withRounding){
                breakText += " rounded-l-lg"
            }
        }
        if (lineCommands.breakRight){
            breakText += " mr-1"
            if (withRounding){
                breakText += " rounded-r-lg"
            }
        }
        return breakText;
    }
    const getLineType = (lineType:number) => {
        switch (lineType){
            case 0:
                // Solid line
                return {height: '1px', background: 'black', borderTop: 'None'};
            case 1:
                // Dashed line
                return { 
                    height: '1px',
                    borderTop: 'none',
                    background:
                     `repeating-linear-gradient(to right,gray,gray
                      ${dashLength}px,transparent 
                      ${dashLength}px,transparent 
                      ${dashLength + dashSpacing}px)`,
                    backgroundSize: `${dashLength + dashSpacing}px 100%`
                    };
                    
            case 2:
                // Hidden line
                return {height: '1px', background: 'black', borderTop: 'None', visibility: 'hidden'};
            default:
                // This should never happen
                return {height: '1px', background: 'black', borderTop: 'None'};
        }
    }
    

    return (
        <div className="flex flex-col gap-0.5 justify-center my-0.5">
        {groupSchedule.map((lineType,index) =>
        <hr key={index} className={lineType == 0 ? `${getLineBreaks(true)}`: ""} style={getLineType(lineType) as React.CSSProperties} />)}
        </div>
       
    );
}
const BlockDisplay = (props: AssignmentDisplayProps) => {
    const lineCommands = props.lineCommands;
    const deriveLineBreaks= () => {
        let lineBreak = ""
        let definedBorder = false;
        if (lineCommands.breakLeft){
            lineBreak += "ml-0.5"
            if (!lineCommands.breakRight && !lineCommands.isLast){
                definedBorder = true;
                lineBreak += " rounded-l-lg border-l-2 border-t-2 border-b-2"
            }
        } else if (lineCommands.breakRight){
            lineBreak += " mr-0.5"
            if (!lineCommands.breakLeft && !lineCommands.isFirst){
                definedBorder = true;
                lineBreak += " rounded-r-lg border-r-2 border-t-2 border-b-2"
            }
        } else {
            // If we are in the middle segment don't place a border left or right
            definedBorder = true;
            lineBreak += " border-t-2 border-b-2"
            if (lineCommands.isLast){
                lineBreak += " border-r-2 rounded-r-lg"
            }
            if (lineCommands.isFirst){
                lineBreak += " border-l-2 rounded-l-lg"
            }
        }
        if (!definedBorder){
            lineBreak += " rounded-lg border-2"
        }
        return lineBreak;
    }
    const getSymbol = (groupId:number) => {
        if (!props.placeSymbol){
            return (<>&nbsp;</>)
        }
        if (props.assignmentDisplayType == AssignmentDisplayType.NUMBERBLOCKS){
            return groupId;
        } else {
            return GlyphTable(groupId);
        }
    }
    const deriveHeight = () => {
        if (props.assignmentDisplayType == AssignmentDisplayType.NUMBERBLOCKS){
            return "h-5";
        } else {
            return `h-${glyphSize/3}`;
        }
    }
    const deriveJustify = () => {
        if (!props.placeSymbol){
            return "justify-center";
        } else if (lineCommands.breakLeft && lineCommands.breakRight){
            return "justify-center";
        } else if (lineCommands.breakLeft && !lineCommands.isLast){
            return "justify-end";
        } else if (lineCommands.breakRight && !lineCommands.isFirst){
            return "justify-start";
        } else {
            return "justify-center";
        }
    }
    return (
        <div className="flex flex-col">
            <div className="flex flex-row">
                <div className={`border-black flex-grow flex items-center ${deriveJustify()} ${deriveHeight()} ${deriveLineBreaks()} px-0.5 pb-0.5 text-base font-medium`}>{getSymbol(props.groupId)}</div>
            </div>
        </div>
    );
}
const AssignmentDisplay = (props: AssignmentDisplayProps) => {
    switch (props.assignmentDisplayType) {
        case AssignmentDisplayType.LINETHICKNESS:
            return <LineThicknessDisplay {...props} />;
        case AssignmentDisplayType.LINEHEIGHT:
            return <LineHeightDisplay {...props} />;
        case AssignmentDisplayType.LINECONNECTOR:
            return <LineConnectorDisplay {...props} />;
        case AssignmentDisplayType.NUMBERBLOCKS:
        case AssignmentDisplayType.GLYPHBLOCKS:
            return <BlockDisplay {...props} />;
        default:
            return <></>;
    }
}
export default AssignmentDisplay