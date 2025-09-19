import { useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import { Switch } from "@mui/material";
import WithLabel from "../auxiliary/WithLabel";
import ToolTip from "../auxiliary/ToolTip";
import Button from "../auxiliary/Button";
import DropDownSelect from "../auxiliary/DropDownSelect";
import { Operator, TemplatePreset } from "../../datatypes/settings";
import { getEnumOptions, checkIsStudyMode } from "../../services/settings";
import { Task } from "../../datatypes/network";
import { PredefinedTask } from "../../services/Tasks";

interface TaskCreationPageProps {
    handleExitTaskCreation: (unparsedInput:string, task: Task | null) => void;  
    existingTask: Task | PredefinedTask | null;
}

const TaskCreationPage = (props: TaskCreationPageProps) => {
    let initalInputString = "";
    const initialTaskId = props.existingTask && props.existingTask.taskId ? props.existingTask.taskId : "Explanation";
    if (props.existingTask) {
        if ("input" in props.existingTask) {
            initalInputString = props.existingTask.input;
        } else if ("inputSegments" in props.existingTask) {
            initalInputString = props.existingTask.inputSegments.join("");
        }
    }
    const initalTemplateString = props.existingTask ? props.existingTask.template : "";
    const initalTargetAnswer = props.existingTask ? props.existingTask.target : "";
    const initalOperator = props.existingTask ? props.existingTask.operator : Operator.CONTAIN;
    const isStudyMode = checkIsStudyMode();
    const initiallyLocked = initialTaskId !== undefined && initialTaskId !== "Custom" && isStudyMode;
    const [inputString, setInputString] = useState<string>(initalInputString);
    const [templateString, setTemplateString] = useState<string>(initalTemplateString);
    const [targetAnswer, setTargetAnswer] = useState<string>(initalTargetAnswer);
    const [operator, setOperator] = useState<Operator>(initalOperator);
    const [templatePreset, setTemplatePreset] = useState<TemplatePreset>(TemplatePreset.NONE);
    const [locked, setLocked] = useState<boolean>(initiallyLocked);
    const [taskId, setTaskId] = useState<string>(initialTaskId);

    const handleToggleTaskLock = () => {
        
        if (!locked) {
            // I.e. that task will be locked now 
            setInputString(initalInputString);
            setTemplateString(initalTemplateString);
            setTargetAnswer(initalTargetAnswer);
            setOperator(initalOperator);
            setTaskId(initialTaskId);
            
        } else {
            // I.e. the task will be unlocked now
            setTaskId("Custom");
        }
        setLocked(!locked);
        
    }
    const handleOperatorChange = (newOperator: string) => {
        if (locked) { return;}
        setOperator(newOperator as Operator);
    }
    const handleExitTaskCreationCompleted = () => {
        if (templateString.includes("{input}") === false) {
            alert("Template must contain '{input}'");
            return;
        } 
        if (inputString === "") {
            alert("Input cannot be empty");
            return;
        }
        if (initiallyLocked && !locked) {
            const confirmed = confirm("Your explanations for this tasks will not be eligible for submission as the task is not locked and may be altered. Proceed?");
            if (!confirmed) { return; }
        }
        const newTask: Task = {
            inputSegments: [],
            template: templateString,
            target: targetAnswer,
            operator: operator,
            taskId: taskId,
        }
        props.handleExitTaskCreation(inputString, newTask);
    }
    const handleKeyDownTemplate = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "{") {
            setTemplateString(templateString + "{input}");
        }
    }
    const handleKeyDownTargetAnswer = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "{") {
            setTargetAnswer(targetAnswer + "{model}");
        }
    }
    const hanldeTemplateInput= (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        let value = event.target.value;
        const lastChar = event.target.value.slice(-1);
        if (lastChar === "{") {
            value = value.slice(0, -1);
        }
        setTemplateString(value);
    }
    const handleTargetAnswerInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        let value = event.target.value;
        const lastChar = event.target.value.slice(-1);
        if (lastChar === "{") {
            value = value.slice(0, -1);
        }
        setTargetAnswer(value);
    }
    const handleTemplatePresetChange = (newTemplatePreset: string) => {
        if (locked) { return; }
        setTemplatePreset(newTemplatePreset as TemplatePreset);
        switch (newTemplatePreset as TemplatePreset) {
            case TemplatePreset.NONE:
                return;
            case TemplatePreset.QA:
                setTemplateString("Answer the following question as succinctly as possible. The answer should contain no more than five words.:\n{input}");
                return;
            case TemplatePreset.QA_WITH_OPTIONS:
                setTemplateString("Below is a question followed by a set of possible answer options. Answer with the letter of the correct answer or an empty response in case none of them are correct. Do not try to randomly guess the answer.\nQuestion:\n{input}\nAnswer Options:\na) A possible answer\nb) B possible answer...");
                return;
            case TemplatePreset.QA_WITH_CONTEXT:
                setTemplateString("Given the following context:\n{input}\nAnswer the following question as succinctly as possible. The answer should contain no more than five words. If you cannot answer then give an empty response.\nQuestion:\nWrite the question here...");
                return;
            case TemplatePreset.SENTIMENT:
                setTemplateString("For the text snippet below answer whether it has positive or negative sentiment. Your answer should be a single letter: p (for positive) or n (for negative). In case you cannot answer leave the response empty.\nText Snippet:\n{input}");
                return;
            default:
                return;

        }
    }
    const lockText = locked ? "This task is locked" : "This task is not eligible for submission";
    return (
        <div className="flex flex-row gap-5 mt-10 pl-10 ">
            <div className="flex flex-col items-center justify-start w-3/4 max-h-3/4">
                <WithLabel label="Input" isBig={true} tooltip={<ToolTip keyword="TaskCreationInput" orientation='right'/>}>
                    <textarea className="text-justify border-2 border-neutral-600 rounded-lg p-3 pt-2 min-h-32 h-32 max-h-96 no-scrollbar" 
                    placeholder="Write the input here..." 
                    value={inputString} onChange={(e) => setInputString(e.target.value)}
                    readOnly={locked}
                    />
                </WithLabel>
                <WithLabel label="Template" isBig={true} tooltip={<ToolTip keyword="TaskCreationTemplate" orientation='right'/>}>
                    <textarea className="border-2 border-neutral-600 rounded-lg px-3 pt-2 min-h-40 h-40 max-h-96 no-scrollbar" placeholder="Write the template here.." value={templateString}
                    onKeyDown={(e) => handleKeyDownTemplate(e)}
                    onChange={(e) => hanldeTemplateInput(e)}
                    readOnly={locked}/>
                </WithLabel>

            </div>
            <div className="flex flex-col gap-1 w-1/4 border-2 border-neutral-600 rounded-lg p-3 pt-2 min-h-1/3 h-1/3">
                {initiallyLocked && 
                <div className="flex flex-row items-center justify-start ">
                    <WithLabel label="Lock Task" isBig={true} tooltip={<ToolTip keyword="TaskLock" orientation='bottom'/>}>
                            <div className="flex flex-row items-center gap-2">
                                <Switch checked={locked} onChange={handleToggleTaskLock} /> <p className="text-md font-semibold text-start">{lockText}</p>
                            </div>
                    </WithLabel>
                </div>}
                <WithLabel label="Template Preset" isBig={true} >
                    <DropDownSelect options={getEnumOptions(TemplatePreset)} selectedKey={templatePreset} onChange={handleTemplatePresetChange} />
                </WithLabel>
                <WithLabel label="Operator" isBig={true} tooltip={<ToolTip keyword="TaskCreationOperator" orientation='bottom'/>}>
                    <DropDownSelect options={getEnumOptions(Operator)} selectedKey={operator} onChange={handleOperatorChange}/>
                </WithLabel>
                <WithLabel label="Target Answer" isBig={true} tooltip={<ToolTip keyword="TaskCreationTargetAnswer" orientation='bottom'/>}>
                    <textarea className="border-2 border-neutral-600 rounded-lg p-2 min-h-12 no-scrollbar" placeholder="Write the target answer here..."
                    value={targetAnswer}
                    onKeyDown={(e) => handleKeyDownTargetAnswer(e)}
                    onChange={(e) => handleTargetAnswerInput(e)}
                    readOnly={locked}/>
                </WithLabel>
                <div className="flex justify-center items-center">
                    <Button onClick={handleExitTaskCreationCompleted} order={1}>
                        Confirm
                    </Button>
                </div>
                
            </div>
            <div className="absolute top-2 right-2">
                <Button onClick={() => props.handleExitTaskCreation("", null)} order={5} noTextPaddings={true}><IoArrowBack /></Button>
            </div>
        </div>
    )
}
export default TaskCreationPage