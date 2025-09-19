import { ChangeEvent } from 'react';

interface Props {
    current_category: string;
    onChange: (newValue: string) => void;
    categories: Array<string>;
}

const CategoricalSlider = (props: Props) => {
    const makeNamePretty = (name: string) => {
        return name.charAt(0) + name.slice(1).toLowerCase();
    };

    const sliderClass = 'relative w-1/2'; // Adjusted width to make the slider shorter

    return (
        <div className="relative top-2 mb-6 ml-1">
            <div className="relative flex items-center">
                {props.categories.map((_, index) => (
                    <div
                        key={index}
                        className="bg-blue-500 absolute h-4 w-4 rounded-full bg-light-gray"
                        style={{
                            left: `${(index / (props.categories.length - 1)) * 47.6 + 1.2}%`,
                            transform: 'translateX(-50%)',
                        }}></div>
                ))}
                <input
                    type="range"
                    min="0"
                    max={props.categories.length - 1}
                    value={props.categories.indexOf(props.current_category)}
                    step={1}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        const index = parseInt(event.target.value);
                        const newValue = props.categories[index];
                        props.onChange(newValue);
                    }}
                    className={`${sliderClass} dark:bg-gray-700 h-2 cursor-pointer appearance-none rounded-lg bg-light-gray accent-blue`}
                />
            </div>
            <div className="relative mt-3 flex w-1/2 justify-between">
                {props.categories.map((category, index) => (
                    <span
                        key={index}
                        className="text-xs"
                        style={{
                            position: 'relative',
                        }}>
                        {makeNamePretty(category)}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default CategoricalSlider;
