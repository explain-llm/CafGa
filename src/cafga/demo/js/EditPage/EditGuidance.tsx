import React, { useState } from 'react';
import '../output.css';
import {FaChevronUp,FaChevronDown} from "react-icons/fa";
import Button from "../auxiliary/Button";
const EditGuidance = () => {
    const iconSize = 7;
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    return (
        <div className="flex flex-col gap-1 items-center justify-center max-w-[50%]">
            <div className="flex flex-row gap-1 items-center justify-center ml-3">
                <p className="text-xl" style={{color: 'rgb(39, 30, 158)'}}>Edit Tools</p>
                <div className='mb-1'>
                    <button onClick={()=>setIsExpanded(!isExpanded)} className='items-center justify-center rounded-full bg-neutral-300  hover:bg-neutral-400 text-neutral-800  font-semibold p-1 disabled:bg-neutral-400 transition-all duration-200 disabled:cursor-default'>
                        {isExpanded? <FaChevronUp size={iconSize}/> : <FaChevronDown size={iconSize} />}
                    </button>
                </div>

            </div>
            {isExpanded && <p className="text-justify text-sm overflow-y-scroll  h-20">
                You can select an item by clicking on it. To add items to your selection hold the <i>shift</i> key while clicking on the item to add.
                You can also brush to select a span of items.
                Once you have selected a set of items you will be shown the possible ways you can move them. Scroll down to see the options. <br/>
                 <br/>
                <b>Down</b>: Creates a new group with the selected items as children of the current group.<br/>
                <b>Up</b>: Reverses the effects of <b>Down</b> moving the items back into the parent group.<br/>
                <b>Left & Right</b>: Moves the selected items to the group of the item to the left or right of the select items.<br/>

            </p>}
        </div>
    );
}
export default EditGuidance;
