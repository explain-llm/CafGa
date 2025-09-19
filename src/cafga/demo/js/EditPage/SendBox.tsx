import React, { useState } from "react";
import '../output.css';
import { EvaluationDirection } from "../datatypes/settings";
import Button from "../auxiliary/Button";
import { getEnumOptions } from "../services/settings";
import ToolTip from "../auxiliary/ToolTip";
import WithLabel from "../auxiliary/WithLabel";
import DropDownSelect from "../auxiliary/DropDownSelect";

interface SendBoxProps {
    handleSend: (direction:string, sampleName: string | null) => void;
}

const SendBox = (props: SendBoxProps) => {
    const [direction, setDirection] = useState<EvaluationDirection>(EvaluationDirection.DELETION);
    const [sampleName, setSampleName] = useState<string | undefined>(undefined);
    const handleDirectionChange = (newDirection: string) => {
        setDirection(newDirection as EvaluationDirection);
    }
    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let newString = event.target.value;
        if (newString === ""){
            setSampleName(undefined);
        } else {
            setSampleName(event.target.value);
        }
    }
    const handleSend = () => {
        if (sampleName === "" || sampleName === undefined) {
            // The python backend requires that I pass null if the sample name is empty 
            // Instead of undefined so outside of this componenet sampleName is alway string | null
            props.handleSend(direction, null);
        } else {
            props.handleSend(direction, sampleName);
        }
    }
    const nameStyle = { color: sampleName === undefined ? "gray" : "black", borderColor: sampleName === undefined ? "gray" : "black"};
    return (
        <div className="flex flex-col gap-2 w-full items-center h-fit px-2 rounded-lg">
            {/* <p className="font-bold text-lg">Attribute and Evaluate</p> */}
            <WithLabel
            label="Evaluation Direction"
            tooltip={null} >
                <DropDownSelect options={getEnumOptions(EvaluationDirection)} selectedKey={direction} onChange={handleDirectionChange}/>
            </WithLabel>
            <WithLabel label="Sample Name" 
            tooltip={null} >
                <input type="text" className="border-2 rounded-lg p-1.5" style={nameStyle} value={sampleName} onChange={handleNameChange} placeholder={"Give me a name"}/>

            </WithLabel>
            <div className="flex flex-row w-1/2 justify-center items-center gap-2">
                <Button onClick={handleSend} order={1}>
                    Confirm
                </Button>
            </div>
        </div>
    )
}

export default SendBox;