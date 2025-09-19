import { ChangeEvent } from 'react';

interface Props {
    value: number;
    onChange: (newValue: number) => void;
    minValue: number;
    maxValue: number;
    isInteger: boolean;
    size?: 'small' | 'big';
}

const NumberSlider = (props: Props) => {
    const parseNumber = props.isInteger ? parseInt : parseFloat;

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        props.onChange(parseNumber(event.target.value));
    };

    const boxClass =
        props.size === 'small' ? 'px-1.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';
    const fontClass = props.size === 'small' ? 'font-medium' : 'font-bold';
    const sliderClass = props.size === 'small' ? 'w-2/3' : 'w-1/2';
    const translateClass =
        props.size === 'small' ? 'translate-x-24' : 'translate-x-16';

    return (
        <div className="relative mb-2 flex items-center justify-start gap-1.5">
            <div className="text-sm text-gray">{props.minValue}</div>

            <input
                type="range"
                min={props.minValue}
                max={props.maxValue}
                value={props.value}
                step={
                    props.isInteger
                        ? 1
                        : (props.maxValue - props.minValue) / 100
                }
                onChange={handleChange}
                className={`${sliderClass} dark:bg-gray-700 h-2 cursor-pointer appearance-none rounded-lg bg-light-gray accent-blue`}
            />

            <div className="text-sm text-gray">{props.maxValue}</div>

            <div
                className={`absolute left-1/2 ${translateClass} top-1/2 -translate-y-1/2 rounded-lg border border-blue text-blue ${boxClass} ${fontClass}`}>
                {props.value.toFixed(props.isInteger ? 0 : 2)}
            </div>
        </div>
    );
};

export default NumberSlider;
