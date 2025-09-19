import React, { PropsWithChildren } from 'react';
import '../output.css';
interface Props {
    label: string;
    tooltip?: React.ReactNode;
    isBig?: boolean;
}

const WithLabel = (props: PropsWithChildren<Props>) => {
    const isBig = props.isBig || false;
    const textSize = isBig ? "text-lg" : "text-sm";
    return (
        <div className="flex w-full flex-col gap-1">
            <div className="flex items-center justify-start gap-2">
                <div className={`${textSize} font-bold text-dark-gray`}>
                    {props.label}
                </div>
                {props.tooltip}
            </div>
            {props.children}
        </div>
    );
};

export default WithLabel;
