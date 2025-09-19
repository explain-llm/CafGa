import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import '../output.css';

export interface DropDownOption {
    key: string;
    value: string;
}

interface Props {
    options: Array<DropDownOption>;
    selectedKey: string;
    onChange: (key: string) => void;
    disabled?: boolean;
}

const DropDownSelect = (props: Props) => {
    const [isExpanded, setExpanded] = useState<boolean>(false);

    const getSelectedKey = (): string | undefined => {
        let selectedOption = props.options.find(
            (option: DropDownOption) => option.key === props.selectedKey
        );
        return selectedOption?.value;
    };

    return (
        <button
            onClick={() => setExpanded(!isExpanded)}
            onBlur={() => setExpanded(false)}
            disabled={props.disabled}
            className="relative w-full cursor-pointer rounded-full border border-light-gray bg-white px-5 py-2 text-left transition-all duration-200 hover:border-gray focus:border-dark-gray disabled:cursor-default disabled:border-light-gray disabled:bg-ghost-white disabled:text-gray">
            {getSelectedKey()}

            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm">
                {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
            </div>

            {isExpanded ? (
                <div className="absolute left-5 right-5 top-full z-50 max-h-40 w-fit translate-y-1.5 cursor-pointer overflow-hidden overflow-y-scroll rounded-lg border border-light-gray bg-white">
                    {props.options.map(
                        (option: DropDownOption, index: number) => (
                            <div
                                onClick={() => props.onChange(option.key)}
                                className="bg-light-gray bg-opacity-35 px-4 py-2 transition-all duration-200 hover:bg-blue hover:bg-opacity-15"
                                key={index}>
                                <span
                                    className={`${option.key === props.selectedKey ? 'font-semibold' : ''}`}>
                                    {option.value}
                                </span>
                            </div>
                        )
                    )}
                </div>
            ) : null}
        </button>
    );
};

export default DropDownSelect;
