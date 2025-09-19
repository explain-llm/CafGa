import { Task } from "../../datatypes/network";
import { Operator } from "../../datatypes/settings";
import WithLabel from "../auxiliary/WithLabel";

import { prettyEnumTable } from "../../services/settings"; 
interface TaskDescriptionProps {
    task: Task;
}
const TaskDescription = (props:TaskDescriptionProps) => {
    const task = props.task;
    return (
        <div className="mt-2 h-full flex flex-col gap-1 justify-start items-start">
            <div className="max-h-fit w-full">
                <WithLabel label="Template">
                    <textarea className="w-full h-[10rem] max-h-fit p-2 border-2 border-black rounded-lg focus:outline-none no-scrollbar"
                    value={task.template} readOnly={true}>
                    </textarea>
                </WithLabel>
            </div>
            <div className="flex flex-row gap-2  w-full justify-start items-start">
                <div className="w-fit text-nowrap min-w-1/3 max-w-1/2">
                    <WithLabel label="Target Answer">
                        <p className="px-2 py-1 border-2 border-black rounded-lg resize-none focus:outline-none no-scrollbar h-fit text-start ">
                            {task.target}
                        </p>
                    </WithLabel>
                </div>
                <WithLabel label="Operator">
                    <p className="px-2 py-1 border-2 border-black rounded-lg w-fit h-fit"> 
                        {prettyEnumTable(Operator, task.operator)}
                    </p>
                </WithLabel>

            </div>
        </div>
    )
}
export default TaskDescription;