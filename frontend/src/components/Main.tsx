import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Task, Explanation } from '../datatypes/network';
import { PersonalInformation, PersonalInformationPostRequest } from '../datatypes/study';
import {standardizeAssignments} from '../services/GroupedTextUtils';
import { postAttributionEvaluationRequest, postParseAndPredictRequest} from '../router/resources/groupedText';
import { postPersonalInformation } from '../router/resources/study';
import { Tree, Node } from '../datatypes/tree';
import { recreateTree } from '../services/tree';
import { IoArrowBack } from "react-icons/io5";
import WelcomePage from './WelcomePage';
import SideBar from './sidebar/SideBar';
import GuidancePopup from './sidebar/GuidancePopup';
import SettingsPopup from './sidebar/SettingsPopup';
import ImportPopup from './sidebar/ImportPopup';
import IdentificationPopup from './sidebar/IdentificationPopup';
import Button from './auxiliary/Button';
import EditPage from './EditPage/EditPage';
import SampleComparisonView from './SampleDisplay/SampleComparisonView';
import TaskCreationPage from './TaskCreationPage/TaskCreationPage';
import { PredefinedTask } from '../services/Tasks';
import { checkIsStudyMode, annulModeSwitchIfUnregistered, persistPersonalInformation, getPersonalInformation, getSettings } from '../services/settings';
import { PersonalInformationPostResponse } from "../datatypes/study";





const Main = () =>{
    
    const [guidanceOpen, setGuidanceOpen] = useState<boolean>(false);
    const [isImportPopupOpen, setImportPopupOpen] = useState<boolean>(false);
    const [isSettingsPopupOpen, setSettingsPopupOpen] = useState<boolean>(false);
    const [isIdentificationPopupOpen, setIdentificationPopupOpen] = useState<boolean>(false);
    const [registrationSuccess, setRegistrationSuccess] = useState<boolean>(false);
    const [personalInformation, setPersonalInformation] = useState<PersonalInformation | undefined>(getPersonalInformation());
    const [personalInformationResponse, setPersonalInformationResponse] = useState<PersonalInformationPostResponse | undefined>(undefined);
    const [hideSamples, setHideSamples] = useState<boolean>(true);
    const [samples, setSamples] = useState<Explanation[]>([]);
    const [task, setTask] = useState<Task|PredefinedTask|null>(null);
    const [editHierarchy, setEditHierarchy] = useState<Tree|undefined>(undefined);
    const [inTaskEditor, setInTaskEditor] = useState<boolean>(false);
    const [fromSampleDisplay, setFromSampleDisplay] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleCloseSettingsPopup = (isSave? : boolean) => {
        setSettingsPopupOpen(false);
        const switchedToStudyMode = checkIsStudyMode();
        setIdentificationPopupOpen((isSave || false) && switchedToStudyMode);
    }

    const sendPersonalInformation = (personalInformation : PersonalInformation) => {
        setPersonalInformation(personalInformation);
        const request : PersonalInformationPostRequest = {
            personalInformation: personalInformation,
            confirmSamePerson: personalInformationResponse?.nameExists || false,
            confirmChangeInformation: personalInformationResponse?.userAlreadyRegistered || false
        }
        postPersonalInformation(request).then((data) => {
            setPersonalInformationResponse(data);
            setRegistrationSuccess(!(data.nameChange || data.userAlreadyRegistered || data.nameExists));
            if (!(data.nameChange || data.userAlreadyRegistered || data.nameExists)) {
                persistPersonalInformation(personalInformation);
            }
        });
        
    }
    const receiveAttributionsFile = (file: Explanation) => {
        file.group_assignments = standardizeAssignments(file.group_assignments);
        const newSamples = [file,...samples];
        setSamples(newSamples);
        setTask(null);
        setInTaskEditor(false);
        if (file.edit_hierarchy !== undefined){
            setEditHierarchy(recreateTree(file.edit_hierarchy));
        }
        setHideSamples(false);
    }
    const handleSelectedExample = (selectedTask: PredefinedTask|null) => {
        setTask(selectedTask);
        setInTaskEditor(true);
        setEditHierarchy(undefined);
    }
    const handleMoveToTaskEditor = (currentTask?: Task, fromSampleDisplay?:boolean) => {
        if (currentTask) {
            setTask(currentTask);
        } 
        // else {
        //     setTask(null);
        // }
        if (fromSampleDisplay !== undefined) {
            setFromSampleDisplay(fromSampleDisplay);
        }
        setInTaskEditor(true);
    }
    const handleExitTaskEditor = (unparsedInput:string, newTask: Task | null) => {
        
        if (newTask) {
            postParseAndPredictRequest(unparsedInput, newTask).then((data) => {
                if (data) {
                    setTask(data);
                    setEditHierarchy(undefined);
                    setInTaskEditor(false);
                } else {
                    console.error("No data returned from server");
                }
            });
        } else {
            setInTaskEditor(false);
            if (fromSampleDisplay) {
                setHideSamples(false);
                setTask(null);
            }
        }
        
    }
    const handeCancelEdit = () => {
        setTask(null);
    }
    const handleExitSampleDisplay = () => {
        setHideSamples(true);
    }
    const handleReturnToSampleDisplay = () => {
        setHideSamples(false);
    }
    const handleRemoveSample = (sampleIndex:number) => {
        const newSamples = samples.filter((_,index) => index !== sampleIndex);
        setSamples(newSamples);
    }
    const handleMoveFromSampleDisplayToEdit = (task: Task, editHierarchy: Node |undefined) => {
        setTask(task);
        if (editHierarchy !== undefined){
            setEditHierarchy(recreateTree(editHierarchy));
        } else {
            console.error("Edit hierarchy is undefined");
        }
    }
    const handleSend = (task: Task, assignments: number[], direction:string, editHierarchy: Node, sampleName: string | null) => {
        if (task == null) {
            return;
        }
        const modelToExplain = getSettings().modelToExplain;
        const res = postAttributionEvaluationRequest(
            task,
            assignments,
            direction,
            editHierarchy,
            sampleName,
            modelToExplain
        );
        res.then((data) => {
            const newSamples = [data,...samples];
            setSamples(newSamples);
            setHideSamples(false);
            setTask(null);
            if (data.edit_hierarchy !== undefined){
                setEditHierarchy(recreateTree(data.edit_hierarchy));
            }
        });

    }
    const handleMoveToExplanationComparison = () => {
        navigate("/explanation-comparison");
    }
    const taskIsReady = task != null && task.hasOwnProperty("inputSegments") 
    return (
        <div className="fixed bottom-0 left-0 right-0 top-0 bg-ghost-white px-[3.75rem] py-6">
            {!inTaskEditor && (hideSamples || samples.length == 0) && !taskIsReady && <WelcomePage onTaskSelect={handleSelectedExample} openGuidancePopup={() => setGuidanceOpen(true)} customTaskSelected={handleMoveToTaskEditor} handleMoveToExplanationComparison={handleMoveToExplanationComparison}/>}
            {inTaskEditor && <TaskCreationPage existingTask={task} handleExitTaskCreation={handleExitTaskEditor} />}
            {!inTaskEditor && taskIsReady && <EditPage task={task as Task} existingEditHierarchy={editHierarchy} handleCancel={handeCancelEdit} handleSend={handleSend} handleMoveToTaskEditor={handleMoveToTaskEditor}/>}
            {!inTaskEditor && samples.length > 0 && !taskIsReady && !hideSamples && <SampleComparisonView samples={samples} handleExitSampleView={handleExitSampleDisplay} handleMoveToEdit={handleMoveFromSampleDisplayToEdit} handleMoveToTaskEditor={handleMoveToTaskEditor} handleRemoveSample={handleRemoveSample} />}
            <SideBar
            openSettingsPopup={() => setSettingsPopupOpen(true)}
            openImportPopup={() => setImportPopupOpen(true)}
            openGuidancePopup={() => setGuidanceOpen(true)}
            openIdentificationPopup={personalInformation != undefined ? () => {setIdentificationPopupOpen(true); setRegistrationSuccess(false)} : undefined}
            returnSample={(sample: Explanation) => receiveAttributionsFile(sample)}
            />
            <SettingsPopup
            isOpen={isSettingsPopupOpen}
            onClose={handleCloseSettingsPopup}
            />
            <IdentificationPopup
            isOpen={isIdentificationPopupOpen}
            registrationSuccess={registrationSuccess}
            existingPersonalInformation={personalInformation}
            personalInformationResponse={personalInformationResponse}
            handleInputConfirmation={sendPersonalInformation}
            onClose={() => setIdentificationPopupOpen(false)}
            />
            <GuidancePopup isOpen={guidanceOpen} onClose={() => setGuidanceOpen(false)}/>

            <ImportPopup isOpen={isImportPopupOpen} onClose={() => setImportPopupOpen(false)} returnFile={receiveAttributionsFile}/>
            {samples.length > 0 && hideSamples && task == null && !inTaskEditor &&
            <div className="absolute top-2 right-2">
                <Button onClick={handleReturnToSampleDisplay} order={5} noTextPaddings={true}><IoArrowBack /></Button>
            </div>}
        </div>
    )
    
    

}
export default Main