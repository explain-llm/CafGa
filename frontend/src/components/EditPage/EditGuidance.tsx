import { useState } from 'react';
import {FaChevronUp,FaChevronDown} from "react-icons/fa";
import Button from "../auxiliary/Button";
const EditGuidance = () => {
    const iconSize = 7;
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    return (
        <div className="flex flex-col gap-1 items-center justify-center max-w-[60%]">
            <div className="flex flex-row gap-1 items-center justify-center ml-3">
                <p className="text-xl" style={{color: 'rgb(39, 30, 158)'}}>How can I edit?</p>
                <div className='mt-1.5'>
                    <Button onClick={()=>setIsExpanded(!isExpanded)} order={3} noTextPaddings={true}>
                        {isExpanded? <FaChevronUp size={iconSize}/> : <FaChevronDown size={iconSize} />}
                    </Button>
                </div>

            </div>
            {isExpanded && <p className="text-justify text-sm overflow-y-scroll no-scrollbar  h-20">
                <b>Selecting Words: </b> You can select a word by clicking on it. Click again to select the group it is part of. To add words to your selection hold the <i>shift</i> key while clicking on the item to add.
                You can also brush to select a span of words, by clicking just outside of the text and dragging.
                <b> Scroll down</b> to see how you can <b>group</b> the selected words. <br/><br/>
                <b>Down</b>: Moves the selected words to a new group. Available if all selected words are in the same group. <br/>
                <b>Up</b>: Undoes <b>Down</b> reversing the grouping.<br/>
                <b>Left & Right</b>: Moves the selected words to the group of the word to the left or right of the select words.<br/>

            </p>}
        </div>
    );
}
export default EditGuidance;
