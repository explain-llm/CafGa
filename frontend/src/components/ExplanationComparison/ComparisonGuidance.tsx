import "../WelcomePage.css";
import { useState } from "react";
import { IoInformation } from "react-icons/io5";
import { IoMdCloudUpload } from "react-icons/io";

import BlurCover from "../auxiliary/BlurCover";
import Button from "../auxiliary/Button";
interface ComparisonGuidanceProps {
    handleContinue: () => void;
}
const ComparisonGuidance = (props: ComparisonGuidanceProps) => {
    const doNothing = () => {};
    const [selectedExample, setSelectedExample] = useState<number>(2);
    const examples = [
        "A good explanation",
        "An okay explanation",
        "Your preferred explanation"
    ]; 

    return (
        <>
            <BlurCover onClick={props.handleContinue} />
            <div className="flex flex-col items-center gap-3 absolute z-30 bg-white p-3 rounded-xl h-[80svh] w-fit px-10 border-2 border-gray-200 shadow-lg">
                <h1 className="ExplanationComparisonBanner">Explanation Comparison</h1>
                <div className="flex flex-row">
                    <p className="text-sm text-slate-500 whitespace-pre-wrap">You can return to this introduction whenever you want by clicking on the info button </p>
                    <Button order={5} noTextPaddings={true} onClick={doNothing}> <IoInformation size={12}/></Button>
                    <p className="text-sm text-slate-500 whitespace-pre-wrap"> in the top right corner.</p>
                </div>
                <div className="flex flex-col items-center h-5/6 overflow-y-auto gap-2 w-3/5">
                    <div className="justify-start">
                        <p className="font-bold text-xl text-start">Task: </p>
                        <div className="flex flex-col gap-2 justify-center items-center w-full text-justify">
                            <p>In the following you will be shown a series of explanations. In each case you will be shown three explanations in the format below. Choose the one you think is best by checking the corresponding radial selector on the right.</p>
                            <div className="flex flex-col gap-1 w-[18rem]">
                                {examples.map((example, index) => {
                                    return (
                                        <div key={index} className="flex flex-row gap-2 w-full items-center">
                                            <p className="border-2 border-black px-2 rounded-lg w-3/4">{example}</p>
                                            <input type="radio" className="size-5 bg-green-300 on-blur-none rounded-full" checked={2 === index} onClick={() => setSelectedExample(index)} />
                                        </div>
                                    )
                                })}
                            </div>
                            <p><b>How should I compare the explanations? </b> Imagine that you are working with an AI that made a decision and these are the explanations you are given for why. Which explanation helps you the most in understanding why the model made that decision?</p>
                        </div>
                        <p className="font-bold text-xl text-start">Submission: </p>
                        <div className="flex flex-row">
                            <p className="whitespace-pre-wrap text-start">You can submit your choices by clicking on the submission button </p>
                            <Button order={5} noTextPaddings={true} onClick={doNothing}> <IoMdCloudUpload size={15} /></Button>
                        </div>

                    </div>
                </div>
                <p className="text-sm text-slate-500">Note: Reloading this webpage will lose all your progress!</p>
                <Button order={1} onClick={props.handleContinue}>
                    Continue
                </Button>
            </div>
            
        </>
    );
}
export default ComparisonGuidance