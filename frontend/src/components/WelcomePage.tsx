import { useState } from "react";
import { GoInfo } from "react-icons/go";
import "./WelcomePage.css";
import TaskSelectionPage from "./TaskSelectionPage";
import OptionBox from "./auxiliary/OptionBox";
import { PredefinedTask } from "../services/Tasks";
import { checkIsStudyP1, checkIsStudyP2 } from '../services/settings';

interface WelcomePageProps {
    onTaskSelect: (task: PredefinedTask) => void;
    openGuidancePopup: () => void;
    customTaskSelected: () => void;
    handleMoveToExplanationComparison: () => void;
}
const WelcomePage = (props:WelcomePageProps) => {
    const [openTaskSelector, setOpenTaskSelector] = useState<boolean>(false);
    const isStudyModeP1 = checkIsStudyP1();
    const isStudyModeP2 = checkIsStudyP2();
    const taskSelectorTitle = isStudyModeP1 ? "Study Tasks" : "Predefined Tasks";
    const taskSelectorDescription = isStudyModeP1 ? "Select a task for the study." : "Select a task from a list of predefined tasks.";

    const closeTaskSelector = (selectedTask?: PredefinedTask) => {
        if (selectedTask !== undefined){
            props.onTaskSelect(selectedTask);
        }
        setOpenTaskSelector(false);
    }
    const beginExplanationComparison = () => {
        props.handleMoveToExplanationComparison();
    }
    return (
        <>
            {!openTaskSelector && 
            <div className="flex flex-col gap-5">
                <div>
                    <div className="WelcomeBanner">
                        CafGa
                    </div>
                    <div className="font-semibold text-lg">
                        Custom assignments for Group attributions
                    </div>
                </div>
                <div className="flex flex-col gap-8 items-center text-center">
                    <div className="flex flex-col gap-1">
                            <p className="text-wrap whitespace-pre-wrap">CafGa allows you to create explanations at arbitrary granularity of attribution. <br />To get started pick an example task below or create your own task. </p>
                        <div className="flex flex-row items-center justify-center text-center gap-1 text-sm text-slate-500">
                            <p className="whitespace-pre-wrap align-middle">For a detailed introduction click</p>
                            <button onClick={props.openGuidancePopup}>
                                <GoInfo size={18} />
                            </button>
                                <p className="whitespace-pre-wrap align-middle">on the left-hand side or watch <a href="https://youtu.be/0nuAJhMITV4" className="underline text-blue-500" target="_blank">this</a></p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 w-2/3">
                        <OptionBox isBig={true} title={taskSelectorTitle} description={taskSelectorDescription} onClick={() => setOpenTaskSelector(true)}/>
                        <OptionBox isBig={true} title="Custom Task" description="Create your own task with the task creator." onClick={() => props.customTaskSelected()}  />
                    </div>
                        {isStudyModeP2 && 
                    <div className={`flex flex-col gap-1 p-3 justify-center items-center w-3/5 h-fit border-2 rounded-lg border-gray-500 hover:border-black whitespace-pre-wrap cursor-pointer shadow-lg`}
                        onClick={beginExplanationComparison}>
                        <div className={`font-semibold text-xl`} >Begin Explanation Comparison</div>
                        <div className="">This option is available to you as part of the study. Thank you for your participation! <br/>By clicking on this button you will be moved to the second part of the study where you will be comparing given explanations.</div>
                    </div>
                    }
                </div>
            </div>}
            {openTaskSelector && <TaskSelectionPage closeTaskSelector={closeTaskSelector} />}

        </>
    );
    }
export default WelcomePage