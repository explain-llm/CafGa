import React from 'react';
import '../output.css';
import {FaChevronLeft,FaChevronUp,FaChevronDown, FaChevronRight} from "react-icons/fa";
interface MovementButtonsProps {
    moveIconSize?: number;
    visibilityArray: boolean[];
    handleGoLeft: () => void;
    handleGoUp: () => void;
    handleGoDown: () => void;
    handleGoRight: () => void;
}

const MovementButtons = (props: MovementButtonsProps) => {
    const moveIconSize = props.moveIconSize ? props.moveIconSize : 20;
    const halveIconSize = Math.floor(moveIconSize / 2)+1;
    let visArray = props.visibilityArray;
    let onlyDown = visArray[2] && !visArray[0] && !visArray[1] && !visArray[3];
    let anythingOn = visArray[0] || visArray[1] || !visArray[2] || !visArray[3];
    let haveY = visArray[1] || visArray[2];
    let downAndSide = !visArray[1] && visArray[2] && (visArray[0] || visArray[3]);
    return (
        <div className="flex flex-row justify-center mt-0.5">
            <button onClick={props.handleGoLeft} className={`${visArray[0] ? '':'invisible'}`}><FaChevronLeft size={moveIconSize}/></button>
            <div className="flex flex-col">
            {!onlyDown && haveY && <button onClick={props.handleGoUp} className={`${visArray[1] ? '':'invisible'} `}><FaChevronUp size={downAndSide ? halveIconSize :  moveIconSize}/></button>}
            {haveY && <button onClick={props.handleGoDown} className={`${visArray[2] ? '':'invisible'}`}><FaChevronDown size={moveIconSize}/></button>}
            </div>
            {props.handleGoRight !== undefined && props.handleGoRight !== null && 
            <button onClick={props.handleGoRight} className={`${visArray[3] ? '':'invisible'}`}><FaChevronRight size={moveIconSize}/></button>}
        </div>
    )
}
export default MovementButtons;