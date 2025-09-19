import "../WelcomePage.css";
import BlurCover from "../auxiliary/BlurCover";
import Button from "../auxiliary/Button";

interface SubmissionScreenProps {
    handleSubmission: () => void;
    handleExit: () => void;
    visited: boolean[];
}
const SubmissionScreen = (props: SubmissionScreenProps) => {
    const allVisited = props.visited.every((value) => value);
    return (
        <>
            <BlurCover onClick={props.handleExit} />
            <div className="flex flex-col items-center gap-3 absolute z-30 bg-white p-3 rounded-xl h-[27rem]  w-3/4 p-10 border-2 border-gray-200 shadow-lg">
                <h1 className="SubmissionBanner">Submission</h1>
                <p className="w-3/4"> You can submit your choices once you have viewed all the explanations as indicated below. Once you submit there is no going back, so make sure you are happy with your choices.</p>
                <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-2 gap-x-6 border-2 border-gray-400 py-2 px-4 rounded-lg w-fit max-h-1/2 overflow-y-auto">
                        {props.visited.map((value, index) => {
                            return (
                                <div key={index} className="flex flex-row items-center justify-between gap-2">
                                    <p className="font-bold text-xl">Comparison {index + 1}: </p>
                                    <input type="checkbox" className={"size-5 bg-green-300 on-blur-none rounded-full"} checked={value} readOnly />
                                </div>
                            )
                        }) }
                    </div>
                    <div className="flex flex-row w-full justify-between">
                        <Button onClick={props.handleExit} order={3}>Cancel</Button>
                        <Button onClick={props.handleSubmission} disabled={!allVisited} order={1}>Submit</Button>
                    </div>
                </div>

            </div>
            
            
        </>
    );
}

export default SubmissionScreen;