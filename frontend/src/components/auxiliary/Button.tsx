import { PropsWithChildren } from 'react';

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
                'bg-blue-500 hover:bg-blue-700 text-white font-medium disabled:bg-neutral-400';
            break;
        case 2:
            orderClasses =
                'bg-neutral-300 w-full hover:bg-neutral-400 text-neutral-800  disabled:bg-neutral-400';
            break;
        case 3:
            orderClasses =
                'bg-neutral-300 hover:bg-neutral-400 text-neutral-800 disabled:bg-neutral-400';
            break;
        case 4:
            orderClasses =
                'bg-neutral-300 hover:bg-neutral-400 text-neutral-800 disabled:bg-neutral-400 text-sm';
            break;
        case 5:
            orderClasses =
                'bg-neutral-300 hover:bg-neutral-400 text-neutral-800 disabled:bg-neutral-400 text-xl';
            break;
        case 6:
            orderClasses =
                'disabled:bg-neutral-400 bg-neutral-100 border-2 border-neutral-500 hover:border-neutral-900  text-neutral-600 hover:text-neutral-900';
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
            className={`flex ${props.noTextPaddings ? 'p-1' : 'px-4 py-1.5'} font-normal items-center justify-center rounded-full ${orderClasses} transition-all duration-200 disabled:cursor-default flex flex-row gap-1`}>
            {props.children}
        </button>
    );
};

export default Button;
