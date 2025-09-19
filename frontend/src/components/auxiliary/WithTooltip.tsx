import { PropsWithChildren, useState } from 'react';

interface Props {
    text: string;
    direction: 't' | 'r' | 'b' | 'l';
}

const WithTooltip = (props: PropsWithChildren<Props>) => {
    const [isTooltipShown, setTooltipShown] = useState<boolean>(false);

    let positionClasses: string = '';
    switch (props.direction) {
        case 't':
            positionClasses = `left-1/2 -translate-x-1/2 bottom-full -translate-y-1.5`;
            break;
        case 'r':
            positionClasses = `top-1/2 -translate-y-1/2 left-full translate-x-0.5`;
            break;
        case 'b':
            positionClasses = `left-1/2 -translate-x-1/2 top-full translate-y-1.5`;
            break;
        case 'l':
            positionClasses = `top-1/2 -translate-y-1/2 right-full -translate-x-0.5`;
            break;
    }

    return (
        <div
            onMouseEnter={() => setTooltipShown(true)}
            onMouseLeave={() => setTooltipShown(false)}
            className="relative">
            {props.children}

            {isTooltipShown && (
                <div
                    className={`absolute ${positionClasses} text-nowrap rounded-full bg-slate-700 px-3 py-1.5 text-sm font-semibold text-white`}>
                    {props.text}
                </div>
            )}
        </div>
    );
};

export default WithTooltip;
