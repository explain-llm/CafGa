import { useEffect, useState } from 'react';

import { IoIosSettings } from 'react-icons/io';
import { MdDeleteForever } from 'react-icons/md';
import { RxHamburgerMenu } from 'react-icons/rx';
import { TbReload } from "react-icons/tb";
import { MdOutlineDriveFolderUpload } from "react-icons/md";
import { GoInfo } from "react-icons/go";

import Button from '../auxiliary/Button';
import BlurCover from '../auxiliary/BlurCover';
import WithTooltip from '../auxiliary/WithTooltip.tsx';
import IconButton from '../auxiliary/IconButton.tsx';
import ToolTip from '../auxiliary/ToolTip.tsx';
import Loading from '../auxiliary/loading/Loading.tsx';
import HistoryButton from './HistoryButton.tsx';

import { SampleHistory, Explanation } from '../../datatypes/network.ts';
import { getSampleHistory } from '../../router/resources/groupedText.ts';
import { deleteAllSamples, deleteSample } from '../../router/resources/groupedText.ts';
import { getPersonalInformation } from '../../services/settings.ts';

interface SideBarProps {
    openSettingsPopup: () => void;
    openImportPopup: () => void;
    openGuidancePopup: () => void;
    openIdentificationPopup?: () => void;
    returnSample: (sample: Explanation) => void;
}

const SideBar = (props: SideBarProps) => {
    const personalInformation = getPersonalInformation();
    const [highlightGuidance, setHighlightGuidance] = useState<boolean>(personalInformation === undefined);
    const [isShown, setShown] = useState<boolean>(false);
    const [history, setHistory] = useState<Explanation[]>([]);
    const [isHistoryLoading, setHistoryLoading] = useState<boolean>(true);
    useEffect(() => {
        getSampleHistory().then((res: SampleHistory | undefined) => {
            if (res === undefined) {
                return;
            }

            setHistoryLoading(false);
            setHistory(res.samples);
        });
    }, []);
    const openGuidance = () => {
        setShown(false);
        setHighlightGuidance(false);
        props.openGuidancePopup();
    };
    const openSettings = () => {
        setShown(false);
        props.openSettingsPopup();
    };

    const openImport = () => {
        setShown(false);
        props.openImportPopup();
    };
    const handleItemClicked = (index: number) => {
        props.returnSample(history[index]);
    }
    const handleDeleteAllClicked = () => {
        if (!confirm('Are you sure you want to permanently delete all samples?')) {
            return;
        }
        deleteAllSamples().then(() => {
            setHistory([]);
        });
    }
    const handleItemDeleted = (index: number) => {
        deleteSample(history[index].sample_id).then(() => {
            setHistory(history.filter((_, i) => i !== index));
        });
    }
    const handleReload = () => {
        getSampleHistory().then((res: SampleHistory | undefined) => {
            if (res === undefined) {
                return;
            }
            setHistoryLoading(false);
            setHistory(res.samples);
        });
    }
    const guidanceHighlight = highlightGuidance ? ' border-2 border-blue-500 rounded-lg ' : '';

    return (
        <div className="fixed left-3 top-3 flex flex-col gap-1">
            <IconButton onClick={() => setShown(true)}>
                <RxHamburgerMenu size={22} />
            </IconButton>

            <IconButton onClick={() => openImport()}>
                <MdOutlineDriveFolderUpload size={22} />
            </IconButton>

            <IconButton onClick={() => openSettings()}>
                <IoIosSettings className='hover:animate-spin' size={24} />
            </IconButton>
            <div className={`flex flex-row items-center justify-center gap-1`}>
                <div className={`${guidanceHighlight}`}>
                    <IconButton onClick={() => openGuidance()}>
                        <GoInfo size={24} />
                    </IconButton>
                </div>
                {highlightGuidance &&
                <div className='text-blue-600 font-medium cursor-pointer' onClick={() => openGuidance()}>New here? Click Me</div>
                }
            </div>
            <div
                className={`fixed bottom-0 top-0 w-sidebar ${isShown ? 'left-0' : '-left-full'} z-30 flex flex-col justify-start border-r-2 border-light-gray bg-white p-3 shadow-lg transition-all duration-200`}>
                <div className="mb-6 flex items-center justify-start gap-3">
                    <div className="flex aspect-square w-14 items-center justify-center rounded-full border-2 border-blue-500 bg-opacity-30 p-1">
                        <img src="./eth.png" className="w-4/5" />
                    </div>
                    <div className="flex flex-col">
                        <div className="text-2xl">
                            CafGa &nbsp; &nbsp;
                            <ToolTip
                                keyword="name_explanation"
                                orientation="bottom"
                            />
                        </div>
                        <div className="text-xs text-dark-gray">
                            IVIA Lab - ETH Zürich
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    {props.openIdentificationPopup &&
                    <div className="flex flex-col gap-2">
                        <Button onClick={() => { setShown(false); props.openIdentificationPopup!(); }} order={2}>
                            Change Info
                        </Button>
                    </div>}
                    <Button onClick={openImport} order={1}>
                        Import
                    </Button>
                </div>
                <div className="mt-6 flex items-center justify-between">
                    <div className="font-semibold text-dark-gray flex flex-row items-center gap-1">
                        <p>History</p>
                        <button
                            className="text-xs disabled:text-gray"
                            onClick={handleReload}
                            disabled={history.length === 0}>
                            <TbReload size={16}/>
                        </button>
                    </div>
                    {isHistoryLoading ? (
                        <Loading size={16} stroke={1} />
                    ) : (
                        <button
                            className="text-xl disabled:text-gray"
                            onClick={handleDeleteAllClicked}
                            disabled={history.length === 0}>
                            <WithTooltip text={'Delete All'} direction={'l'}>
                                <MdDeleteForever />
                            </WithTooltip>
                        </button>
                    )}
                </div>

                {!isHistoryLoading && (
                    <div className="mb-2 mt-2 flex flex-col gap-2 overflow-y-auto">
                        {history.map((sample: Explanation, index: number) => (
                            <HistoryButton
                                onClick={() => handleItemClicked(index)}
                                sample={sample}
                                onDelete={() => handleItemDeleted(index)}
                                key={index}
                            />
                        ))}

                        {history.length === 0 && (
                            <div className="text-sm text-gray">
                                Nothing here yet
                            </div>
                        )}
                    </div>
                )}


                <div className="mt-auto flex w-full flex-col gap-2">
                    <Button onClick={openSettings} order={6}>
                        <IoIosSettings
                            className="mr-1 inline-block hover:animate-spin "
                            size={20}
                        />
                        Settings
                    </Button>
                </div>
            </div>

            {isShown ? <BlurCover onClick={() => setShown(false)} /> : null}
        </div>
    );
};

export default SideBar;
