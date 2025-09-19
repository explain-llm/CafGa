import { useEffect, useState } from "react";
import {Explanation, Task} from "../../datatypes/network";
import { EvaluationDirection } from "../../datatypes/settings";
import { IoArrowBack } from "react-icons/io5";
import { IoInformation } from "react-icons/io5";
import {FaChevronUp,FaChevronDown} from "react-icons/fa";
import Button from "../auxiliary/Button";
import SampleDisplay from "./SampleDisplay";
import { Node } from "../../datatypes/tree";
import DifferenceCurveGuidance from "./DifferenceCurveGuidance";
import DifferenceCurve from "./DifferenceCurve";
import DifferenceAreaChart from "./DifferenceAreaChart";
import { Reorder } from "motion/react";


interface SampleComparisonViewProps {
    samples: Explanation[];
    handleExitSampleView: () => void;
    handleMoveToEdit: (task:Task, editHierarchy:Node|undefined) => void;
    handleMoveToTaskEditor: (task:Task, fromSampleDisplay?: boolean) => void;
    handleRemoveSample: (sampleIndex:number) => void;
}
const SampleComparisonView = (props:SampleComparisonViewProps) => {
    let indexList = props.samples.map((_, index) => index);
    const [sampleIndeces, setSampleIndeces] = useState<number[]>(indexList);
    const [showGuidance, setShowGuidance] = useState<boolean>(false);
    useEffect(() => {
        indexList = props.samples.map((_, index) => index);
        setSampleIndeces(indexList);
    }
    , [props.samples]);
    
    const handleRemoveSample = (removedIndex:number) => {
        let newSampleIndeces = indexList.filter((_,index) => index !== removedIndex);
        for (let i = 0; i < newSampleIndeces.length; i++) {
            if (newSampleIndeces[i] > removedIndex) {
                newSampleIndeces[i]--;
            }
        }
        setSampleIndeces(newSampleIndeces);
        props.handleRemoveSample(removedIndex);
    }

    let numDeletion = 0;
    let numInsertion = 0;
    let direction;
    let allEvaluated = true;
    for (let i = 0; i < props.samples.length; i++) {
        if (props.samples[i].differences === undefined || props.samples[i].differences!.length === 0) {
            allEvaluated = false;
            break;
        }
        direction = props.samples[i].direction;
        if (direction === EvaluationDirection.DELETION) {
            numDeletion++;
        } else if (direction === EvaluationDirection.INSERTION) {
            numInsertion++;
        }
    }
    const [differenceCurveExpanded, setDifferenceCurveExpanded] = useState<boolean>(allEvaluated);
    const displayHeight = differenceCurveExpanded ? "h-[45vh]" : "h-[90vh]";

    const commonEvaluationDirection = numDeletion >= numInsertion ? EvaluationDirection.DELETION : EvaluationDirection.INSERTION;
    const showDifferenceGraphs = differenceCurveExpanded && allEvaluated ? "" : "hidden";
    return (

        <div className="flex w-full justify-center">
            <div className="flex flex-col w-screen mx-10 justify-center ">
                <div className="flex flex-col items-center justify-center gap-1 relative">
                    {/*Overflow-hidden so that the graphs' overflow does not block the button*/}
                    <div className={`flex flex-row  ${showDifferenceGraphs} border-2 rounded-lg border-neutral-600 py-2 w-full items-center justify-center overflow-hidden`}>
                        <div className="absolute top-2 right-2">
                            <Button onClick={() => setShowGuidance(true)} order={5} noTextPaddings={true}><IoInformation size={22} /></Button>
                        </div>
                        <DifferenceCurve groupAttributionsList={props.samples}/>
                        <DifferenceAreaChart groupAttributionsList={props.samples}/>
                    </div>
                    <div className="flex w-1/2 justify-center items-center">
                        {allEvaluated && <Button onClick={()=>setDifferenceCurveExpanded(!differenceCurveExpanded)} order={2} noTextPaddings={true}>
                            {differenceCurveExpanded? <FaChevronUp /> : <FaChevronDown />}
                        </Button>}
                    </div>
                </div>
                <div className={`flex flex-col overflow-y-scroll ${displayHeight} gap-2 py-1 no-scrollbar`}>
                    <Reorder.Group values={sampleIndeces} onReorder={setSampleIndeces}>
                        {sampleIndeces.map((sampleIndex) => {
                            return (
                                <Reorder.Item key={sampleIndex} value={sampleIndex}>
                                    <SampleDisplay
                                    key={sampleIndex}
                                    explanation={props.samples[sampleIndex]}
                                    sampleIndex={sampleIndex}
                                    commonEvaluationDirection={commonEvaluationDirection}
                                    handleRemoveSample={() => handleRemoveSample(sampleIndex)}
                                    handleMoveToEdit={props.handleMoveToEdit}
                                    handleMoveToTaskEditor={props.handleMoveToTaskEditor}
                                    disableSubmission={false} />
                                </Reorder.Item>
                            )
                        })}
                    </Reorder.Group>
                
                </div>
                <div className="absolute top-2 right-2">
                    <Button onClick={props.handleExitSampleView} order={5} noTextPaddings={true}><IoArrowBack /></Button>
                </div>
            </div>
            <DifferenceCurveGuidance isOpen={showGuidance} onClose={() => setShowGuidance(false)} />
        </div>
    )
}
export default SampleComparisonView;
