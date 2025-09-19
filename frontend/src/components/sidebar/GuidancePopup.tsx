import "../WelcomePage.css"
import { IoIosSettings } from "react-icons/io";
import { GoInfo } from "react-icons/go";
import { RxCross1 } from "react-icons/rx";
import BlurCover from "../auxiliary/BlurCover";
import { Explanation } from "../../datatypes/network";
import { Operator, EvaluationDirection } from "../../datatypes/settings";
import SampleDisplay from "../SampleDisplay/SampleDisplay";
import Button from "../auxiliary/Button";
interface GuidanceProps {
    isOpen: boolean;
    onClose: () => void;
}

const ExampleExplanation: Explanation = 
  { "task": { 
      "inputSegments": ["I'm ", "excited ", "to ", "use ", "CafGa, ", "but ", "I'm ", "still ", "unsure ", "about ", "its ", "usage."], 
    "template": "For the text snippet below answer whether it has positive or negative sentiment. Your answer should be a single letter: p (for positive) or n (for negative). In case you cannot answer leave the response empty.\nText Snippet:\n{input}", 
      "target": "p", 
      operator: Operator.EQUAL, 
      "originalPrediction": ["p", "p", "p", "p", "p", "p", "p", "p", "1.0"], 
      "predefinedEditHierarchy": { "nodeId": "dummy", "parent": null, "children": [], "textIds": [] }, 
      "taskId": "guidanceexample" }, 
    "group_assignments": [0, 1, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2], 
    "attributions": [0.0, 0.5, -0.5], 
    "execution_time": 0.80059814453125, 
    "n_samples_generated": 8,
    "direction": EvaluationDirection.DELETION,
    "differences": [1.0, 1.0, 0.0], 
    "edit_hierarchy": { "nodeId": "b0ea053e-13d9-4392-92b2-d11c0ac55efa", "parent": null, "children": [{ "nodeId": "21770ef7-76f8-4f9d-a258-372632faa274", "parent": null, "children": [{ "nodeId": "d0e3ad1a-e101-4175-abfe-95d166c554ed", "parent": null, "children": [], "textIds": [1] }, { "nodeId": "b1c4e24b-11db-49e9-8dee-11c861562101", "parent": null, "children": [], "textIds": [8, 9, 10, 11] }], "textIds": [0, 2, 3, 4, 5, 6, 7] }], "textIds": [] }, 
    "sample_name": "Example", 
    "sample_id": "1dfc9f7c-b975-4369-be11-89b7c5f79789" 
  };




const GuidancePopup = (props: GuidanceProps) => {
  const doNothing = () => {};
  return (
    <div className={`${props.isOpen ? '' : 'hidden'} w-full items-center justify-center flex`}>
      <BlurCover onClick={props.onClose} />
      <div className="absolute flex flex-col top-10 bottom-10 z-20 max-w-settings w-5/6 mx-48 max-h-5/6 flex-col justify-between gap-4 rounded-xl border-2 border-light-gray bg-white p-4 shadow-lg items-center">
        <div className="absolute top-3 left-3">
          <Button onClick={props.onClose} noTextPaddings={true} order={4}>
            <RxCross1 size={20} />
          </Button>
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="GuidanceBanner">What is CafGa?</p>
          <div className="flex flex-row">
            <p className="text-sm text-slate-500 whitespace-pre-wrap">You can return to this introduction whenever you want by clicking on the info button </p>
             <GoInfo size={22} />
            <p className="text-sm text-slate-500 whitespace-pre-wrap"> on the left side.</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 overflow-y-auto h-fit max-h-5/6">
          <div className="text-justify text-lg ">
            CafGa is a tool that allows users to create attribution-based explanations of large language models' decisions at arbitrary granularities by grouping the words in the input.
            The attribution shows how important a given group of words is for the model's decision. A video introduction can be found <a href="https://youtu.be/0nuAJhMITV4" className="underline text-blue-600" target="_blank">here</a>.
          </div>
          <div className="text-2xl font-bold w-fullitems-start justify-start text-start mt-2">
            Example Explanation:
          </div>
          <div className="w-full px-5 ">
            <SampleDisplay explanation={ExampleExplanation} sampleIndex={0} handleRemoveSample={doNothing} handleMoveToEdit={doNothing} handleMoveToTaskEditor={doNothing} suppressEvaluationDirectionWarning={true} disableSubmission={false}/>
          </div>
          <div className="text-justify text-lg">
          <b>What is happening here?</b> The task given to the model is shown on the right side of the display under <b>Task Description</b>. Here the model is asked to classify the input text on the left as positive or negative sentiment. 
           <b> Operator</b> "Equals" and <b>Target Answer</b> "p" means that the model's responses are evaluated by checking whether the response "equals" "p". 
           For each input multiple responses are sampled and the percentage of responses for which the operator holds true is treated as the model's numerical prediction.
          <br/>In the left part of the display you can see the input (which is pasted into the {"\{input\}"} part of the template) and the generated attributions.
           Here "excited" contributed towards the positive prediction and "still unsure about how I can use it." detracted from the positive prediction. 
          You can see how the words are grouped based on the line below the words. 
          A contiguous line indicates belonging to the same group. 
          A break in the line delineates the end of a group (e.g. between "I'm" and "still"). 
          A dashed line means the group is interrupted, but continues past the dashed line (e.g. "excited" is in a separate group). <br/>
          To see a graph of the attributions and the model's responses to the task you can change the right-hand display by clicking on the arrow buttons around <b>Task Description</b>. The cross allows you to remove the explanation. "Reassign" allows you to change the group assignments. "Task" allows you to change the task.
          </div>
          <div className="text-2xl font-bold w-full items-start justify-start text-start mt-2">
            Getting started:
          </div>
          <div className="text-justify text-lg">
            <b>How do I use CafGa?</b> To get started you can either select a task from the landing page or create your own task. You will then go through the task editor and the assignment editor.
            <div className="text-lg font-bold w-full items-start justify-start text-start mt-2">
              Task Editor:
            </div>
            Upon selecting a predefined task or choosing to make a custom task you will be moved to the task editor. 
            Here you can describe the task by defining the input, template, target answer and operator. Click confirm to move to the assignment editor.
            <div className="text-lg font-bold w-full items-start justify-start text-start mt-2">
              Assignment Editor:
            </div>
            Once the task is confirmed you will be moved to the assignment editor. Here you can group the words in the input. Once you have grouped the words you can press send to get an explanation.
          </div>
          <div>
            <div className="text-2xl font-bold w-full items-start justify-start text-start mt-2">
              Participating in the Study:
            </div>
              <div className="text-justify text-lg text-wrap">
                  <b>I'm participating in the study. What do I need to do?</b> There are two parts to the study. The first part is concerned with creating explanations using CafGa.
                In the second part explanations created with CafGa are compared to other explanation approaches. Below are the steps to register and the steps to follow for each part.<br />
                <div className="text-lg font-bold w-full items-start justify-start text-start mt-2">
                  Registration:
                </div>
              </div>
              <div className="flex flex-row text-justify text-lg text-wrap whitespace-pre-wrap items-center ">1. Navigate to the settings page by clicking <IoIosSettings size={18}/> on the left-hand side. <br/></div>
              <div className="text-justify text-lg text-wrap">
              2. Under "Move to Study" select either "Study (Creating Explanations)" or "Study (Comparing Explanations)". You can ignore the other settings.<br />
              3. Once you click save you will be asked to enter a username and optionally some background information. <br/>
              4. Once you have entered the information click confirm to complete the registration. <br /> 
              <div className="text-lg font-bold w-full items-start justify-start text-start mt-2">
                Creating Explanations:
              </div>
              1. Selected a task from the study tasks list. The tasks have a fixed order. To unlock the next task you must submit an explanation for the current task. <br/>
              2. Once a task is selected you will be shown the task editor. 
              In the study you will not be able to edit the task, but you can use this page to familiarize yourself with the task. Once you have read the task click confirm to move to the assignment editor.  <br/>
              3. In the assingment editor you can group the words. To get an explanation you can click send. You can ignore the evaluation direction for now.
              If you are unsure what kind of grouping makes sense, a good strategy is to start at a fixed granularity (use the presets to quickly select one) and then refining the parts that look interesting.
              <br/>
              4. Using the reassign button you can redo your assignments to get a new explanation. Try out some different assignments to test different parts of the input. For example you may want to drill down to find which specific parts are the most important.<br/>
              5. Once you have found what you consider to be a good explanation you can submit it. Submitting another explanation for the same task will overwrite your previous explanation.<br /> 
              6. Repeat the above steps for all the tasks. <br/>
              7. Once you have submitted an explanation for all the tasks you will get a button to fill out a questionaire. Click on this button to complete the study. Link (in case the button does not work):  <br/>
              <p className="text-lg w-full items-start justify-start text-start mt-2 whitespace-pre-wrap">
                
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSePYl8bz_kvwSDqr1pQgQ6XybLCt6YTXj2tfNOMjlnNI4VMwQ/viewform?usp=dialog"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-500 underline"
                >  https://docs.google.com/forms/d/e/1FAIpQLSePYl8bz_kvwSDqr1pQgQ6XybLCt6YTXj2tfNOMjlnNI4VMwQ/viewform?usp=dialog
                </a>
                <br/>
              </p>
              <div className="text-lg font-bold w-full items-start justify-start text-start mt-2">
                Comparing Explanations:
              </div>
              1. Watch <a href="https://youtu.be/FBpxSX82kSE" className="underline text-blue-600" target="_blank">this introductory video</a> to familiarize yourself with CafGa.
              1.2 If you still feel unsure about what these explanations are, try following the example shown in the video. You do not need to register for the study yet. Pick the example from the predefined task list. <br/>
              2. Follow the registration steps shown above to register for the "Study (Comparing Explanations)". <br/>
              3. Once you changed the setting to enter the study you will see a button to move to the comparison page. Click on this button and follow the instructions on that page.
            </div>
          </div>
        </div>


      </div>
    </div>

  );
}

export default GuidancePopup;