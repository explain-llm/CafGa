interface ColorGradientProps {
    negative: string;
    negativeHalfway: string;
    positiveHalfway: string;
    positive: string;
}
const ColorGradient = (props: ColorGradientProps) => {
    const { negative, negativeHalfway, positiveHalfway, positive} = props;

    const gradientStyle = {
        background: `linear-gradient(to right, ${negative} 0%, ${negativeHalfway} 25%, white 50%, ${positiveHalfway} 75%, ${positive} 100%)`,
        height: '15px',
        width: '120px',
    };
    return (
        <div className="flex flex-row h-full items-center justify-center justify-items-center gap-1">
            <p className="mb-1" style={{color: negative, fontWeight: 'bold' }}>Detracting</p>
            <div className="rounded-md flex" style={gradientStyle}> </div>
            <p className="mb-1" style={{color: positive, fontWeight: 'bold'}}>Contributing</p>
        </div>)
}
export default ColorGradient;