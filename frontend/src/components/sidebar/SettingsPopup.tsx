import { useEffect, useState } from 'react';
import "../WelcomePage.css";
import BlurCover from '../auxiliary/BlurCover';
import {
    AssignmentDisplayType,
    DisplaySettings,
    ColourPalette,
    CurveInterpolation,
    ModelToExplain,
    UsageMode,
} from '../../datatypes/settings';
import { getSettings, persistSettings, prettyEnumTable } from '../../services/settings';
import Button from '../auxiliary/Button';
import WithLabel from '../auxiliary/WithLabel';
import DropDownSelect, { DropDownOption } from '../auxiliary/DropDownSelect';
import { deepEqual } from '../../services/util';
import ToolTip from '../auxiliary/ToolTip';

interface PopupProps {
    isOpen: boolean;
    onClose: (isSave? : boolean) => void;
}

const SettingsPopup = (props: PopupProps) => {
    const [savedSettings, setSavedSettings] =
        useState<DisplaySettings>(getSettings());
    const [settings, setSettings] = useState<DisplaySettings>(getSettings());

    useEffect(() => {
        setSettings(getSettings());
        setSavedSettings(getSettings());
    }, [props.isOpen]);

    const haveSettingsChanged = (): boolean => {
        return !deepEqual(savedSettings, settings);
    };
     // --- Enums ---
     const getEnumOptions = (enumClass: any): Array<DropDownOption> => {
         const options: Array<DropDownOption> = [];

         for (const enumCase of Object.keys(enumClass)) {
            options.push({
                key: enumCase,
                value: prettyEnumTable(enumClass, enumCase),
            });
        }

        return options;
    };

    const handleAssignmentDisplayTypeChange = (assignmentDisplayType: string) => {
        setSettings({
            ...settings,
            assignmentDisplayType:  AssignmentDisplayType[
                assignmentDisplayType as keyof typeof AssignmentDisplayType
            ]
        });
    };
    const handleColourPaletteChange = (colourPalette: string) => {
        setSettings({
            ...settings,
            colourPalette: ColourPalette[
                colourPalette as keyof typeof ColourPalette
            ]
        });
    }
    const handleCurveInterpolationChange = (curveInterpolation: string) => {
        setSettings({
            ...settings,
            curveInterpolation: CurveInterpolation[
                curveInterpolation as keyof typeof CurveInterpolation
            ]
        })
    }
    const handleModelToExplainChange = (modelToExplain: string) => {
        setSettings({
            ...settings,
            modelToExplain: ModelToExplain[
                modelToExplain as keyof typeof ModelToExplain
            ]
        })
    }
    const handleUsageModeChange = (usageMode: string) => {
        setSettings({
            ...settings,
            usageMode: UsageMode[
                usageMode as keyof typeof UsageMode
            ]
        })
    }
    const cancel = () => {
        setSettings(getSettings());
        props.onClose(false);
    };

    const save = () => {
        persistSettings(settings);
        props.onClose(true);
    };

    return (
        <div className={`${props.isOpen ? 'block' : 'hidden'}`}>
            <BlurCover onClick={() => props.onClose(false)} />

            <div className="fixed left-1/2 top-1/2 z-20 flex h-5/6 w-2/3 max-w-settings -translate-x-1/2 -translate-y-1/2 flex-col justify-between gap-4 rounded-xl border-2 border-light-gray bg-white p-4 shadow-lg">
                <div className="flex flex-col">
                    <div className="MediumBanner">Settings</div>
                </div>

                <div className="flex flex-grow flex-col gap-4 overflow-y-scroll no-scrollbar">
                    <div className="-mb-1" />

                    <WithLabel
                        label="Move to Study Mode"
                        tooltip={<ToolTip keyword="UsageMode" orientation='bottom' />}
                        fillHeight={false}>
                        <DropDownSelect
                            options={getEnumOptions(UsageMode)}
                            selectedKey={settings.usageMode}
                            onChange={handleUsageModeChange}
                        />
                    </WithLabel>
                    <WithLabel
                        label="Model To Explain"
                        tooltip={<ToolTip keyword="ModelToExplain" />}
                        fillHeight={false}>
                        <DropDownSelect
                            options={getEnumOptions(ModelToExplain)}
                            selectedKey={settings.modelToExplain}
                            onChange={handleModelToExplainChange}
                        />
                    </WithLabel>
                    <WithLabel
                        label="Assignment Display Type"
                        tooltip={<ToolTip keyword="AssignmentDisplayType" orientation='right'/>}
                        fillHeight={false}
                        >
                        <DropDownSelect
                            options={getEnumOptions(AssignmentDisplayType)}
                            selectedKey={settings.assignmentDisplayType}
                            onChange={handleAssignmentDisplayTypeChange}
                        />
                    </WithLabel>
                    <WithLabel
                        label="Attribution Colour Palette"
                        tooltip={<ToolTip keyword="AttributionColourPalette" />}
                        fillHeight={false}>
                        <DropDownSelect
                            options={getEnumOptions(ColourPalette)}
                            selectedKey={settings.colourPalette}
                            onChange={handleColourPaletteChange}
                        />
                    </WithLabel>
                    <WithLabel
                        label="Curve Interpolation"
                        tooltip={<ToolTip keyword="CurveInterpolation" />}
                        fillHeight={false}>
                        <DropDownSelect
                            options={getEnumOptions(CurveInterpolation)}
                            selectedKey={settings.curveInterpolation}
                            onChange={handleCurveInterpolationChange}
                        />
                    </WithLabel>
            </div>
                <div className="flex justify-end gap-2">
                    <Button onClick={cancel} order={3}>
                        Cancel
                    </Button>
                    <Button
                        onClick={save}
                        order={1}
                        disabled={!haveSettingsChanged()}>
                        Save
                    </Button>
                </div>
        </div>
    </div>
    );
};

export default SettingsPopup;
