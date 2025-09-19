import Button from '../auxiliary/Button.tsx';
import { Explanation } from '../../datatypes/network.ts';
import { useState } from 'react';
import { TiDeleteOutline } from 'react-icons/ti';
import Loading from '../auxiliary/loading/Loading.tsx';
import {FiDownload} from "react-icons/fi";

interface Props {
    onClick: () => void;
    sample: Explanation;
    onDelete: () => void;
}

const HistoryButton = (props: Props) => {
    const [isHovered, setHovered] = useState<boolean>(false);
    const [isLoading, setLoading] = useState<boolean>(false);


    const handleDeleteClicked = (event: any) => {
        event.stopPropagation();

        if (!confirm('Are you sure you want to prermanently delete this sample?')) {
            return;
        }

        props.onDelete();
    };

    const handleExportClicked = async (event: any) => {
        event.stopPropagation();
        setLoading(true);
        try {
            const sampleString = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(props.sample, null, 4));

            const downloadElement = document.createElement('a');
            downloadElement.setAttribute("href", sampleString);
            downloadElement.setAttribute("download", `${props.sample.sample_name}.json`);
            document.body.appendChild(downloadElement);

            downloadElement.click();
            downloadElement.remove();
        } catch (error: any) {
            console.error("An error occurred while trying to export the sample: ", error);
        }
        setLoading(false);
    };

    return (
        <Button
            onClick={props.onClick}
            order={4}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            disabled={isLoading}>
            <div className="flex w-full items-center gap-1">
                {isLoading ? (
                    <div className="py-0.5">
                        <Loading size={15} stroke={1} />
                    </div>
                ) : (
                    <div className="w-full overflow-hidden overflow-ellipsis whitespace-nowrap text-left">
                        {props.sample.sample_name ? props.sample.sample_name : "Unnamed Sample"}
                    </div>
                )}
                {isHovered && !isLoading && (
                    <div className="flex gap-1">
                        <div
                            onClick={handleExportClicked}
                            className="text-lg text-black">
                            <FiDownload />
                        </div>
                        <div
                            onClick={handleDeleteClicked}
                            className="text-lg text-black">
                            <TiDeleteOutline />
                        </div>
                    </div>
                )}
            </div>
        </Button>
    );
};

export default HistoryButton;
