interface Props {
    onClick: () => void;
}

const BlurCover = (props: Props) => {
    return (
        <div
            className="fixed bottom-0 left-0 right-0 top-0 z-10 cursor-pointer backdrop-blur-md"
            onClick={props.onClick}></div>
    );
};

export default BlurCover;
