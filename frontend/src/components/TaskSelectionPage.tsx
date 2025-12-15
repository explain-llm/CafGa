import { useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import "./WelcomePage.css";
import OptionBox from "./auxiliary/OptionBox";
import Button from "./auxiliary/Button";
import { TaskDescriptor, PredefinedTask, predefinedTaskCategories, predefinedStudyTasks, getTask, getTasksFromCategory} from "../services/Tasks";
import { checkIsStudyP1, getCurrentLevel } from "../services/settings";
interface TaskSelectionPageProps {
    closeTaskSelector: (selectedTask?: PredefinedTask) => void;
}

function openSurvey() {
    window.open("https://docs.google.com/forms/d/e/1FAIpQLSePYl8bz_kvwSDqr1pQgQ6XybLCt6YTXj2tfNOMjlnNI4VMwQ/viewform?usp=dialog", "_blank", "noreferrer");
}

const TaskSelectionPage = (props: TaskSelectionPageProps) => {
    const inStudyP1 = checkIsStudyP1();
    const currentLevel = getCurrentLevel();
    const shownTasks = inStudyP1 ? predefinedStudyTasks : predefinedTaskCategories;
    const [predefinedTasks, setPredefinedTasks] = useState<PredefinedTask[]>([]);

    const setTasksFromCategory = (categoryIdx: number) => {
        const tasks = getTasksFromCategory(categoryIdx);
        setPredefinedTasks(tasks);
    }

    return (
        <div>
            <h1 className="TaskSelectionBanner">Tasks</h1>
            <div className="absolute top-2 right-2">
                <Button onClick={() => props.closeTaskSelector()} order={5} noTextPaddings={true}><IoArrowBack /></Button>
            </div>
            
            <div className="flex flex-col items-center  mt-5 h-[80svh] pb-10 max-h-3/4 overflow-y-auto no-scrollbar">

                {!inStudyP1 && <div className="relative w-3/4 flex flex-col items-center ">
                    {predefinedTasks.length > 0 && (
                        <button className="absolute top-1 right-[-20px] bg-gray-200 hover:bg-gray-400 rounded-full p-1" onClick={() => setPredefinedTasks([])}>
                            <IoArrowBack size={24} />
                        </button>
                        )}
                    <div className="grid grid-cols-2 gap-2 items-center justify-center px-4">
                        {predefinedTasks.length == 0 && shownTasks.map((task: TaskDescriptor, index : number) => {
                            return (
                                 <OptionBox key={index} title={task.title} description={task.description} onClick={() => setTasksFromCategory(index)} />
                            );
                        })}
                        {predefinedTasks.length > 0 && predefinedTasks.map((task: PredefinedTask, index: number) => {
                            return (
                                <OptionBox key={index} title={task.title} description={task.description} onClick={() => props.closeTaskSelector(task)} />
                            );
                        })}
                    </div>
                </div>}
                {inStudyP1 && <div>
                    <div className="grid grid-cols-2 gap-2 w-4/6 items-center justify-center ">
                        {shownTasks.map((task: TaskDescriptor, index : number) => {
                            return (
                                (index <= currentLevel) && <OptionBox key={index} title={task.title} description={task.description} onClick={() => props.closeTaskSelector(getTask(index, inStudyP1))} />
                            );
                        })}
                    </div>
                    {currentLevel >= shownTasks.length &&
                    <div className=" w-1/2 mt-3">
                        <OptionBox title="Final Level: Questionaire" description="Thank you for completing all the tasks. Click here to fill out a questionnaire and complete the study. The link can also be found in the introduction." onClick={openSurvey} />
                    </div>}
                </div>}
            </div>

        </div>
    );
}

export default TaskSelectionPage;