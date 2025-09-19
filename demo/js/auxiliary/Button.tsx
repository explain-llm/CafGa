import React, { PropsWithChildren } from 'react';
import '../output.css';

interface Props {
    onClick: () => void;
    order: number; // 1: primary, 2: secondary, 3: ternary
    disabled?: boolean;
    noTextPaddings?: boolean;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
}

const Button = (props: PropsWithChildren<Props>) => {
    let orderClasses: string;
    switch (props.order) {
        case 1:
            orderClasses =
                'bg-blue-500 hover:bg-blue-700 text-white font-semibold disabled:bg-neutral-400';
            break;
        case 2:
            orderClasses =
                'bg-neutral-300 w-full hover:bg-neutral-400 text-neutral-800 font-semibold disabled:bg-neutral-400';
            break;
        case 3:
            orderClasses =
                'bg-neutral-300 hover:bg-neutral-400 text-neutral-800 font-semibold disabled:bg-neutral-400';
            break;
        case 4:
            orderClasses =
                'bg-neutral-300 hover:bg-neutral-400 text-neutral-800 font-semibold disabled:bg-neutral-400 text-sm';
            break;
        case 5:
            orderClasses =
                'bg-neutral-300 hover:bg-neutral-400 text-neutral-800 font-semibold disabled:bg-neutral-400 text-xl';
            break;
        case 6:
            orderClasses =
                ' text-neutral-800 font-semibold disabled:bg-neutral-400';
            break;
        default:
            return null;
    }

    return (
        <button
            onClick={props.onClick}
            disabled={props.disabled}
            onMouseEnter={props.onMouseEnter}
            onMouseLeave={props.onMouseLeave}
            className={"items-center justify-center rounded-full bg-neutral-300  hover:bg-neutral-400 text-neutral-800  font-semibold px-4 disabled:bg-neutral-400 transition-all duration-200 disabled:cursor-default"}>
            {props.children}
        </button>
    );
};

export default Button;
