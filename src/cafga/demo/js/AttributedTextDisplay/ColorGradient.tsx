import React from 'react';
import "../output.css";
interface ColorGradientProps {
    negative: string;
    negativeHalfway: string;
    positiveHalfway: string;
    positive: string;
}
const ColorGradient = (props: ColorGradientProps) => {
    const { negative, negativeHalfway, positiveHalfway, positive} = props;
    // const leftTicks = leftValue/numTicks;
    // const rightTicks = rightValue/numTicks;

    const gradientStyle = {
        background: `linear-gradient(to right, ${negative} 0%, ${negativeHalfway} 25%, white 50%, ${positiveHalfway} 75%, ${positive} 100%)`,
        height: '15px',
        width: '120px',
    };
    // let ticks = new Array(2*numTicks+1);
    // let cur = leftValue;
    // for (let i = 0; i < 2*numTicks+1; i++) {
    //     ticks[i] = cur.toFixed(1);
    //     if (i < numTicks) {
    //         cur -= leftTicks;
    //     } else {
    //         cur += rightTicks;
    //     }
    // }
    return (
        <div className="flex flex-row h-full items-center justify-center justify-items-center gap-1">
            <link href="../../output.css" rel="stylesheet"></link>
            <p className="mb-1" style={{color: negative, fontWeight: 'bold' }}>Detracting</p>
            <div className="rounded-md flex" style={gradientStyle}> </div>
            <p className="mb-1" style={{color: positive, fontWeight: 'bold'}}>Contributing</p>
        </div>)
}
export default ColorGradient;