import { PropsWithChildren } from 'react';

interface Props {
    onClick: () => void;
}

const IconButton = (props: PropsWithChildren<Props>) => {
    return (
        <button
            onClick={props.onClick}
            className="flex aspect-square w-9 items-center justify-center self-start rounded-lg transition duration-200 hover:bg-zinc-200">
            {props.children}
        </button>
    );
};

export default IconButton;
