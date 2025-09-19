import { useState } from "react";
import { EvaluationDirection } from "../../datatypes/settings";
import Button from "../auxiliary/Button";
import { getEnumOptions } from "../../services/settings";
import ToolTip from "../auxiliary/ToolTip";
import WithLabel from "../auxiliary/WithLabel";
import DropDownSelect from "../auxiliary/DropDownSelect";

interface SendBoxProps {
    handleSend: (direction:string, sampleName: string | null) => void;
    taskName?: string;
    numGroups: number;
}

const SendBox = (props: SendBoxProps) => {
    const [direction, setDirection] = useState<EvaluationDirection>(EvaluationDirection.DELETION);
    const [sampleName, setSampleName] = useState<string | undefined>(undefined);
    const [isLoadingSample, setIsLoadingSample] = useState<boolean>(false);
    const handleDirectionChange = (newDirection: string) => {
        setDirection(newDirection as EvaluationDirection);
    }
    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newString = event.target.value;
        if (newString === ""){
            setSampleName(undefined);
        } else {
            setSampleName(event.target.value);
        }
    }
    const handleSend = () => {
        setIsLoadingSample(true);
        if (sampleName === "" || sampleName === undefined) {
            if (props.taskName === undefined) {
                props.handleSend(direction, null);
            }
            else {
                props.handleSend(direction, props.taskName);
            }
        } else {
            props.handleSend(direction, sampleName);
        }
    }
    const nameStyle = { color: sampleName === undefined ? "gray" : "black", borderColor: sampleName === undefined ? "gray" : "black"};
    return (
        <div className="flex flex-col gap-1 w-full items-center h-full">
            {/* <p className="font-bold text-lg">Attribute and Evaluate</p> */}
            <WithLabel
            label="Evaluation Direction"
            tooltip={<ToolTip keyword="EvaluationDirection" orientation="bottom" />}
            fillHeight={false} >
                <DropDownSelect options={getEnumOptions(EvaluationDirection)} selectedKey={direction} onChange={handleDirectionChange}/>
            </WithLabel>
            <WithLabel label="Sample Name (Optional)" 
            fillHeight={false}>
                <input type="text" className="border-2 rounded-lg p-1.5" style={nameStyle} value={sampleName} onChange={handleNameChange} placeholder={"Give me a name"}/>
            </WithLabel>
            <div className="flex flex-col w-full justify-center items-center gap-1">
                <Button onClick={handleSend} order={1}>
                    Send {isLoadingSample && <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>}
                </Button>
                {props.numGroups >= 15 && <p className="text-slate-500 text-sm text-wrap text-justify w-full">You have {props.numGroups} groups. Please note that the resulting attributions may be less accurate.</p>}
                
            </div>
        </div>
    )
}

export default SendBox;