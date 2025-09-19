import React, { PropsWithChildren } from 'react';

interface Props {
    label: string;
    tooltip?: React.ReactNode;
    isBig?: boolean;
    fillHeight?: boolean;
    childLayout?: string;
}

const WithLabel = (props: PropsWithChildren<Props>) => {
    const isBig = props.isBig || false;
    const fillHeight = props.fillHeight == undefined || props.fillHeight;
    const textSize = isBig ? "text-lg" : "text-sm";
    return (
        <div className={`flex flex-col gap-1 w-full ${fillHeight ? 'h-full' : ''}`}> 
            <div className="flex items-center justify-start gap-2">
                <div className={`${textSize} font-bold text-dark-gray w-fit text-nowrap`}>
                    {props.label}
                </div>
                {props.tooltip}
            </div>
            {props.children}
        </div>
    );
};

export default WithLabel;
