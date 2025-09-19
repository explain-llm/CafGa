import { RxCross1 } from "react-icons/rx";
import { IoInformation } from "react-icons/io5";
import "../WelcomePage.css"
import BlurCover from "../auxiliary/BlurCover";
import Button from "../auxiliary/Button";
interface DifferenceCurveGuidanceProps {
    isOpen: boolean;
    onClose: () => void;
}

const DifferenceCurveGuidance = (props: DifferenceCurveGuidanceProps) => {
    return (
        <div className={`${props.isOpen ? '' : 'hidden'} w-full items-center justify-center flex absolute`}>
            <BlurCover onClick={props.onClose} />
            <div className="absolute flex flex-col z-20 max-w-settings w-2/3 top-1/2 max-h-5/6 flex-col justify-between gap-4 rounded-xl border-2 border-light-gray bg-white p-4 shadow-lg items-center">
                <div className="absolute top-3 left-3">
                    <Button onClick={props.onClose} noTextPaddings={true} order={4}>
                        <RxCross1 size={16} />
                    </Button>
                </div>
                <h1 className="MediumBanner">What is a pertubation curve?</h1>
                <div className="flex flex-row">
                    <p className="text-sm text-slate-500 whitespace-pre-wrap">You can return to this introduction whenever you want by clicking on the info button </p>
                    <Button order={5} noTextPaddings={true} onClick={() => {}}> <IoInformation size={12} /></Button>
                    <p className="text-sm text-slate-500 whitespace-pre-wrap"> in the top right corner.</p>
                </div>
                <p className="text-justify text-lg max-h-5/6 overflow-y-auto">
                    The pertubation curve is a metric to measure the <i>fidelity</i> of an attribution-based explanation. 
                    That is to say it measures whether the explanation faithfully represents the model's decision making. 
                    There are two version of the perturbation curve; <b>Deletion</b> and <b>Insertion</b>. 
                    In both cases the attributions are used to create a ranking of the features (the groups in this case) from most to least important.
                    The perturbation curve is then created as follows: <br/>
                    <b>Deletion</b>: Starting with all features present, iteratively remove the most important feature and record the resulting difference between the original prediction and the prediction on the perturbed input.
                    If the features are ranked correctly the difference should quickly increase leading to a <i>large</i> area under the curve. <br/>
                    <b>Insertion</b>: Starting with no features present, iteratively add the most important feature and record the resulting difference between the original prediction and the prediction on the perturbed input.
                    If the features are ranked correctly the difference should quickly decrease leading to a <i>small</i> area under the curve. <br/>
                    <b>So, should I just optimize for the area under the curve?</b> No, the area under the curve is just a metric to measure the fidelity of the explanation, but there are other important qualities to consider as well such as the interpretability of the explanation.
                    
                </p>
            </div>
        </div>
            
    )
}
export default DifferenceCurveGuidance;