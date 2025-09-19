interface OptionBoxProps {
    title: string;
    description: string;
    isBig?: boolean;
    onClick: () => void;
}
const OptionBox = (props: OptionBoxProps) => {
    const isBig = props.isBig || false;
    const boxSize = "w-full min-h-32 h-full";
    const titleSize = isBig ? "text-xl" : "text-lg";
    return (
        <div className={`flex flex-col gap-1 p-3 justify-center items-center ${boxSize} text-wrap border-2 rounded-lg border-gray-400 hover:border-black whitespace-pre-wrap cursor-pointer`} 
            onClick={props.onClick}>
            <div className={`font-semibold ${titleSize}`} >{props.title}</div>
            <div className="">{props.description}</div>
        </div>
    );
}
export default OptionBox