import { RxCross1 } from "react-icons/rx";
import { IoInformation } from "react-icons/io5";
import { FaChevronDown } from "react-icons/fa";
import "../WelcomePage.css"
import BlurCover from "../auxiliary/BlurCover";
import Button from "../auxiliary/Button";
interface DifferenceCurveGuidanceProps {
    isShown: boolean;
    onClose: () => void;
}

const ExtendedEditGuidance = (props: DifferenceCurveGuidanceProps) => {
    return (
        <div className={`${props.isShown ? '' : 'hidden'} w-full items-center justify-center flex absolute`}>
            <BlurCover onClick={props.onClose} />
            <div className="absolute flex flex-col z-20 w-2/3 top-1/2 max-h-5/6 flex-col justify-between gap-4 rounded-xl border-2 border-light-gray bg-white px-6 py-4 shadow-lg items-center">
                <div className="absolute top-3 left-3">
                    <Button onClick={props.onClose} noTextPaddings={true} order={4}>
                        <RxCross1 size={16} />
                    </Button>
                </div>
                <div>
                    <p className="MediumBanner">Edit Page</p>
                    <div className="flex flex-row">
                        <p className="text-sm text-slate-500 whitespace-pre-wrap">You can return to this introduction whenever you want by clicking on the info button </p>
                        <Button order={5} noTextPaddings={true} onClick={() => { }}> <IoInformation size={12} /></Button>
                        <p className="text-sm text-slate-500 whitespace-pre-wrap"> in the top right corner.</p>
                    </div>
                </div>

                <div className="flex flex-col gap-1">
                    <div className="flex flex-row text-start">
                        <p className="text-lg whitespace-pre-wrap text-nowrap text-start"><b>Edit Tools:</b> You can see all the edit tools by clicking on </p>
                        <Button order={5} noTextPaddings={true} onClick={() => { }}> <FaChevronDown size={10} /></Button>
                        <p className="text-lg whitespace-pre-wrap text-nowrap text-start"> beside the "How do I edit?" title.</p>
                    </div>
                    <div className="text-lg text-start">
                        <b>Save button:</b> When you save your current assignment you create a checkpoint. You can return to it by pressing undo. Note that you cannot undo the undo function.
                    </div>
                </div>
                <div>
                    <p className="text-xl font-bold w-full text-start"> Common edits:</p>
                    <div className="flex flex-col gap-1 text-start">
                        <div><b>Grouping many scattered words: </b> First ensure that all the words you want to group are initally in the same group. Then select the first word and use shift click to add the rest. Finally use <b>Down</b> to group them.</div>
                        <div><b>Grouping two long spans that are interrupted by another: </b> Select all three spans and make a new group using <b>Down</b>. Return the span in the middle to the original group using <b>Up</b>.</div>
                        <div><b>Grouping a span over multiple lines: </b> Select the middle section using the brush tool and form a new group using <b>Down</b>. Then select any remaining parts before or after and use <b>Left</b> or <b>Right</b> to add them to the group.</div>
                    </div>
                </div>
                
            </div>
        </div>

    )
}
export default ExtendedEditGuidance;