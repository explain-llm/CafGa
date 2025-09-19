import { RxCross1 } from "react-icons/rx";
import Button from "../auxiliary/Button";
import { Task } from "../../datatypes/network";
import { prettyEnumTable } from "../../services/settings";
import { Operator } from "../../datatypes/settings";
interface TaskDisplayProps {
    handleRemoveDisplay: () => void;
    handleMoveToTaskEditor: () => void;
    task: Task;
    modelPrediction?: string;
}
const TaskDisplay = (props:TaskDisplayProps) => {
    const iconSize = 15;
    const task = props.task;
    const target = task.target;
    const operator = task.operator;
    const modelPrediction = props.modelPrediction;
    return (
        <div className="flex flex-col gap-2 items-center justify-center border-2 rounded-lg border-neutral-600 p-5 relative w-3/4 h-1/2">
            <div className='absolute top-3 left-3'>
                <Button onClick={()=>props.handleRemoveDisplay()} order={3} noTextPaddings={true}>
                    <RxCross1 size={iconSize}/>
                </Button>
            </div>
            <div className="absolute top-3 right-3">
                    <Button onClick={props.handleMoveToTaskEditor} order={3}>Edit</Button>

                </div>
            <div className="flex flex-row gap-1 items-center justify-center relative">
                
                <p className="text-2xl" style={{color: 'rgb(39, 30, 158)'}}>Task Description</p>
                
            </div>
                <p className="text-justify"> </p>
                <div className="flex flex-row justify-between w-full gap-1">
                    <div className="flex flex-col items-start gap-1 items-center h-1/3">
                        <div className="font-bold text-xl text-justify items-centers">Template</div>
                        <div className="text-justify h-[10rem] overflow-y-scroll no-scrollbar whitespace-break-spaces">{task.template}</div>
                    </div>
                    <div className="flex flex-col">
                        <div className="font-bold text-xl  text-nowrap">Target Answer</div>
                        <div>{target.toUpperCase()}</div>
                        {operator!=undefined && <><div className="font-bold text-lg  text-nowrap">Operator</div>
                        <div>{prettyEnumTable(Operator, operator)}</div></>}
                        {modelPrediction!=undefined && <><div className="font-bold text-lg  text-nowrap">Model Prediction</div>
                        <div>{modelPrediction}</div></>}
                    </div>
            </div>
        </div>
    );
}
export default TaskDisplay