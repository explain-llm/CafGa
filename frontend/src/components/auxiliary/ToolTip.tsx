import { useState, useRef } from 'react';
import { AiOutlineInfoCircle } from 'react-icons/ai';

interface Props {
    keyword: string;
    size?: number;
    width?: string;
    orientation?: 'right' | 'bottom';
}

const ToolTip = ({
    keyword,
    size = 16,
    width = '250px',
    orientation = 'right',
}: Props) => {
    const [hovered, setHovered] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const descriptions = {
        name_explanation:
            '"Custom Assignments For Group Attributions"',
        AssignmentDisplayType:
            'How the group assignments are displayed below the text segments.',
        AttributionColourPalette:
            'The colour palette used to display the values of the attributions.',
        CurveInterpolation:
            'The interpolation method used when drawing the perturbation curve. The area chart is updated accordingly though for Catmull-Rom the area shown is that of the linear interpolation. ',
        ModelToExplain:
            'The model whose predictions you wish to explain. Please note that more expensive models may take longer to generate explanations.',
        UsageMode:
            'The mode in which the application is used. Only available in the user study. To begin the study select "Study" and press "Save".',
        EvaluationDirection:
            "<b>Deletion</b> starts with all features present and removes the highest valued feature iteratively. <br> <b>Insertion</b> starts with no features and adds the highest valued feature iteratively.",
        SampleName:
            "The name that will be used to refer to this sample.",
        TaskLock:
            "To make the explanations you create comparable with other methods the task must <b>be locked when confirmed</b>. This means that the input, template, target answer and operator cannot be changed.",
        TaskCreationInput:
            "This describes the input to the model for which you wish to generate the explanation.",
        TaskCreationTemplate:
            "This describes the template for the task you are creating. This part will not be perturbed and not get attributions. The input will be placed inside {input} in the template.",
        TaskCreationOperator:
            "This describes the operator that will be used to evaluate the model's answer.",
        TaskCreationTargetAnswer:
            "This describes the target answer that the operator will be evaluated against. Write <i><b>{model}</b></i> to use the model's original prediction as the answer.", 
        Username:
            "A name to identify you in the user study. This does not need to be your real name. Cannot be changed once confirmed.",
    };

    return (
        <div className="relative inline-block">
            <AiOutlineInfoCircle
                size={size}
                className={`transition-colors duration-200 ${hovered ? 'text-blue-500' : 'text-gray-500'}`}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            />
            {hovered && (
                <div
                    ref={tooltipRef}
                    className={`absolute z-10 ${orientation == 'right' ? 'ml-5' : 'mt-1'} text-start rounded-md bg-black p-3 text-sm text-white opacity-90 ${orientation == 'right' ? 'top' : 'left'}-1/2 -translate-${orientation == 'right' ? 'y' : 'x'}-1/2`}
                    style={{ width: width }}>
                    <div
                        dangerouslySetInnerHTML={{
                            __html:
                                descriptions[
                                    keyword as keyof typeof descriptions
                                ] || '',
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default ToolTip;
