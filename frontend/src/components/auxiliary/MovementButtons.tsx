// import {CiCircleChevLeft, CiCircleChevUp, CiCircleChevDown, CiCircleChevRight } from "react-icons/ci";
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
    const visArray = props.visibilityArray;
    const onlyDown = visArray[2] && !visArray[0] && !visArray[1] && !visArray[3];
    const haveY = visArray[1] || visArray[2];
    const downAndSide = !visArray[1] && visArray[2] && (visArray[0] || visArray[3]);
    // const noneVisible = !visArray[0] && !visArray[1] && !visArray[2] && !visArray[3];
    // const bg = noneVisible ? 'bg-transparent' : 'bg-black';
    const bg = 'bg-white';

    return (
        <div className={`flex flex-row justify-center ${bg} text-black rounded-lg bg-opacity-70`}>
            <button onClick={props.handleGoLeft} className={`${visArray[0] ? '':'invisible'}`}><FaChevronLeft size={moveIconSize}/></button>
            <div className="flex flex-col">
            {!onlyDown && haveY && <button onClick={props.handleGoUp} className={`${visArray[1] ? '':'invisible'} `}><FaChevronUp size={downAndSide ? halveIconSize :  moveIconSize}/></button>}
            {haveY && <button onClick={props.handleGoDown} className={`${visArray[2] ? '':'invisible'} -mt-0.5`}><FaChevronDown size={moveIconSize}/></button>}
            </div>
            {props.handleGoRight !== undefined && props.handleGoRight !== null && 
            <button onClick={props.handleGoRight} className={`${visArray[3] ? '':'invisible'}`}><FaChevronRight size={moveIconSize}/></button>}
        </div>
    )
}
export default MovementButtons;