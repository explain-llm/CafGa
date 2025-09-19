import React from "react";
import { LineCommands } from "../datatypes/network";
import "../output.css";
interface AssignmentDisplayProps {
    groupId: number;
    lineCommands: LineCommands;
    segmentLength: number;
    placeSymbol: boolean;
}
const LineConnectorDisplay = (props: AssignmentDisplayProps) => {
    let lineCommands = props.lineCommands;
    let groupSchedule = lineCommands.groupSchedule;

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
        <div className="flex flex-col gap-0.5 justify-center mt-0.5 mb-1">
        {groupSchedule.map((lineType,index) =>
        <hr key={index} className={lineType == 0 ? `${getLineBreaks(true)}`: ""} style={getLineType(lineType) as React.CSSProperties} />)}
        </div>
       
    );
}
const AssignmentDisplay = (props: AssignmentDisplayProps) => {
    return <LineConnectorDisplay {...props} />;
}
export default AssignmentDisplay