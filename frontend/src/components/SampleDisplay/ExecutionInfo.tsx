interface ExecutionInfoProps {
    executionTime: number;
    nSamplesGenerated: number;
    model?: string;
}

const ExecutionInfo = (props:ExecutionInfoProps) => {
    const execution_time = props.executionTime;
    const n_samples_generated = props.nSamplesGenerated;
    const model = props.model;
    return (
        <div className="border-2 rounded-lg border-neutral-600 p-2 w-full h-fit bg-white mt-3">
                {/* <div className="font-bold text-xl">Execution Info</div> */}
                <div className="flex flex-col items-start">
                    {model && <div className="font-semibold flex flex-row whitespace-pre">Model being explained: <p className="font-normal">{model}</p></div>}
                    <div className="font-semibold flex flex-row whitespace-pre">Execution Time (sec): <p className="font-normal">{execution_time.toFixed(2)}</p></div>
                    {n_samples_generated && n_samples_generated > 0 && <div className="font-semibold flex flex-row whitespace-pre">Number of Samples Generated: <p className="font-normal">{n_samples_generated}</p></div>}
                </div>
            </div>
    );
}
export default ExecutionInfo