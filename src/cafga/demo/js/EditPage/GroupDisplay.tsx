import React from 'react';
import '../output.css';
interface GroupDisplayProps {
    groups: string[];
}
const GroupDisplay = (props: GroupDisplayProps) => {
    return (
        <div className="flex flex-col border-2 rounded-lg p-2 border-black ">
            <p className="font-bold text-xl">Current Groups</p>
            <div className="text-start flex flex-col font-medium h-32 overflow-auto no-scrollbar">
                
                {props.groups.map((groupText, groupId) => {
                    return (
                        <p key={groupId} className="truncate min-h-[22px]">
                            - {groupText}
                        </p>
                    )
                })
                }
            </div>
            

        </div>
    )
}
export default GroupDisplay;