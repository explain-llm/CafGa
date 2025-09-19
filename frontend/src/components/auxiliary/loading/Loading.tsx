import './Loading.css';

interface Props {
    size: number;
    stroke: number;
}

const Loading = (props: Props) => {
    const radius = (props.size / 4);
    const style = {
        '--stroke': `${props.stroke}px`,
        '--size': `${props.size}px`,
        '--radius': `${radius}px`,
        '--neg-radius': `-${radius}px`,
    } as React.CSSProperties;

    return (
        <div className="wheel relative aspect-square" style={style}>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i: number) => (
                <div className="bar bg-gray-400 rounded-full" key={i} />
            ))}
        </div>
    );
};

export default Loading;
