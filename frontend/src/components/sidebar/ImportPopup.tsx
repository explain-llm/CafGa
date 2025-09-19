import {useState} from "react";
import {FileUploader} from "react-drag-drop-files";
import {FaUpload} from "react-icons/fa";
import {GoFileCode} from "react-icons/go";
import "../WelcomePage.css"
import Button from "../auxiliary/Button";
import BlurCover from "../auxiliary/BlurCover";
import {colors} from "../../services/color";
import { Explanation } from "../../datatypes/network";
interface PopupProps {
    isOpen: boolean;
    onClose: () => void;
    returnFile: (file: Explanation) => void;
}
const ImportPopup = (props: PopupProps) => {
    const [isHovering, setHovering] = useState<boolean>(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [fileContent, setFileContent] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileUploaded = (file: any) => {
        const fileReader = new FileReader();
        fileReader.onload = (e) => {
            if (e.target == null) {
                handleFileError();
                return;
            }

            const fileText = e.target.result as string;
            let fileJson: any;
            try {
                fileJson = JSON.parse(fileText);
            } catch (error: any) {
                handleParsingError();
                return;
            }

            setFileName(file.name);
            setFileContent(fileJson);
            setError(null);
        };
        fileReader.readAsText(file, "UTF-8");
    };
    const handleErrorOccurred = (error: string) => {
        setFileName(null);
        setFileContent(null)
        setError(error);
    };

    const handleTypeError = () => {
        handleErrorOccurred('wrong file type');
    };

    const handleFileError = () => {
        handleErrorOccurred('error reading the file');
    };

    const handleParsingError = () => {
        handleErrorOccurred('file doesn\'t contain a valid JSON structure');
    };

    const close = () => {
        setFileName(null);
        setFileContent(null);
        setError(null);
        props.onClose();
    };
    const cancel = () => {
        close();
    };

    const save = () => {
        if (fileContent == null) {
            return;
        }

        props.returnFile(fileContent);
        // Reset the state so the selected file is removed from the input
        setFileName(null);
        setFileContent(null);
        props.onClose();
    };
    return (
        <div className={`${props.isOpen ? 'block' : 'hidden'}`}>
            <BlurCover onClick={props.onClose} />

            <div className="fixed left-1/2 top-1/2 z-20 flex max-h-5/6 w-2/3 max-w-settings -translate-x-1/2 -translate-y-1/2 flex-col justify-between gap-4 rounded-xl border-2 border-light-gray bg-white p-4 shadow-lg">
                <div className="MediumBanner">Import Explanation File</div>

                <FileUploader handleChange={handleFileUploaded} types={['json']} onTypeError={handleTypeError}
                              dropMessageStyle={{visibility: 'hidden'}} onDraggingStateChange={(dragging: boolean) => setHovering(dragging)}
                              children={
                    <div className={'w-full p-4 flex justify-center items-center cursor-pointer rounded-lg border-2 border-dashed'}
                         style={{borderColor: isHovering ? colors.blue : (fileName === null ? colors["dark-gray"] : colors.green), backgroundColor: `${isHovering ? colors.blue : colors.white}22`}}>
                        {fileName === null && <div className={'flex flex-col gap-2 justify-center items-center'}>
                            <FaUpload size={30} />
                            <div>
                                Drop file here or
                            </div>
                            <Button onClick={() => {}} order={1}>
                                Select file
                            </Button>
                        </div>}

                        {fileName !== null && <div className={'flex items-center gap-2'}>
                            <GoFileCode size={25} />
                            {fileName}
                        </div>}
                    </div>
                } />

                <div className="px-3 py-2 rounded-lg bg-red bg-opacity-15 border border-red text-red transition-all duration-200 origin-top"
                     style={{transform: `scaleY(${error === null ? 0 : 100}%)`, marginBottom: `${error === null ? -42 : 0}px`}}>
                    Error: {error}
                </div>

                <div className="flex justify-between">
                    <Button onClick={cancel} order={3}>
                        Cancel
                    </Button>

                    <Button
                        onClick={save}
                        order={1}
                        disabled={fileContent === null}>
                        Save
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ImportPopup;