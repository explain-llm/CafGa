import {
    AssignmentDisplayType,
    DisplaySettings,
    EvaluationDirection,
    ModelToExplain,
    ColourPalette,
    CurveInterpolation,
    Operator,
    AssignmentPreset,
    TemplatePreset,
    UsageMode,
} from '../datatypes/settings';
import { PersonalInformation, CompletedTasks } from '../datatypes/study';

const LOCAL_STORAGE_SETTINGS_KEY: string = 'settings';
const LOCAL_STORAGE_PERSONAL_INFO_KEY: string = 'personalInformation';
const LOCAL_STORAGE_COMPLETED_TASKS_KEY: string = 'completedTasks';

export const DEFAULT_SETTINGS: DisplaySettings = {
    assignmentDisplayType: AssignmentDisplayType.LINECONNECTOR,
    colourPalette: ColourPalette.RB,
    curveInterpolation: CurveInterpolation.LINEAR,
    usageMode: UsageMode.STANDARD,
    modelToExplain: ModelToExplain.GPT4o_mini,
};
export function persistSettings(newSettings: DisplaySettings): void {
    console.log("Persisting settings: ", newSettings);
    const settingsString = JSON.stringify(newSettings);
    localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, settingsString);
}

export function getSettings(): DisplaySettings {
    const settingsString = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
    if (settingsString === null) {
        persistSettings(DEFAULT_SETTINGS);
        return DEFAULT_SETTINGS;
    }

    return JSON.parse(settingsString!) as DisplaySettings;
}

export function persistPersonalInformation(personalInformation: PersonalInformation): void {
    const personalInformationString = JSON.stringify(personalInformation);
    localStorage.setItem(LOCAL_STORAGE_PERSONAL_INFO_KEY, personalInformationString);
}
export function getPersonalInformation(): PersonalInformation | undefined {
    const personalInformationString = localStorage.getItem(LOCAL_STORAGE_PERSONAL_INFO_KEY);
    if (personalInformationString === null) {
        return undefined;
    }
    return JSON.parse(personalInformationString) as PersonalInformation;
}
export function checkIsStudyMode(): boolean {
    return getSettings().usageMode === UsageMode.STUDY_P1 || getSettings().usageMode === UsageMode.STUDY_P2;
}
export function checkIsStudyP1(): boolean {
    return getSettings().usageMode === UsageMode.STUDY_P1;
}
export function checkIsStudyP2(): boolean {
    return getSettings().usageMode === UsageMode.STUDY_P2;
}

export function setStandardMode(): void {
    const settings = getSettings();
    settings.usageMode = UsageMode.STANDARD;
    persistSettings(settings);
}

export function annulModeSwitchIfUnregistered(): void {
    if (localStorage.getItem(LOCAL_STORAGE_PERSONAL_INFO_KEY) === null) {
        setStandardMode();
    }
}

export function getCurrentLevel(): number {
    const completedTasksString = localStorage.getItem(LOCAL_STORAGE_COMPLETED_TASKS_KEY);
    if (completedTasksString === null) {
        localStorage.setItem(LOCAL_STORAGE_COMPLETED_TASKS_KEY, JSON.stringify({currentLevel: 0, completedTask_ids: []}));
        return 0;
    }
    const completedTasks = JSON.parse(completedTasksString) as CompletedTasks;
    return completedTasks.currentLevel;
}
export function incrementCurrentLevel(completedTask_id : string): void {
    const completedTasksString = localStorage.getItem(LOCAL_STORAGE_COMPLETED_TASKS_KEY);
    if (completedTask_id === "guidanceexample") {
        return;
    }
    if (completedTasksString === null) {
        localStorage.setItem(LOCAL_STORAGE_COMPLETED_TASKS_KEY, JSON.stringify({currentLevel: 1, completedTask_ids: [completedTask_id]}));
    } else {
        const completedTasks = JSON.parse(completedTasksString) as CompletedTasks;
        if (completedTasks.completedTask_ids.includes(completedTask_id)) {
            return;
        }
        completedTasks.completedTask_ids.push(completedTask_id);
        completedTasks.currentLevel++;
        localStorage.setItem(LOCAL_STORAGE_COMPLETED_TASKS_KEY, JSON.stringify(completedTasks));
    }
}
function prettyAssignmentDisplayType(assignmentDisplayType: AssignmentDisplayType): string {
    switch (assignmentDisplayType) {
        case AssignmentDisplayType.LINETHICKNESS :
             return "Line Thickness";
        case AssignmentDisplayType.LINEHEIGHT:
            return "Line Height";
        case AssignmentDisplayType.LINECONNECTOR:
            return "Line Connector";
        case AssignmentDisplayType.NUMBERBLOCKS:
            return "Number Blocks";
        case AssignmentDisplayType.GLYPHBLOCKS:
            return "Glyph Blocks";
        default:
            throw new Error("Pretty Formatter got unknown AssignmentDisplayType: " + assignmentDisplayType);
    }
}
function prettyEvaluationDirection(evaluationDirection: EvaluationDirection): string {
    switch (evaluationDirection) {
        case EvaluationDirection.DELETION:
            return "Deletion";
        case EvaluationDirection.INSERTION:
            return "Insertion";
        default:
            throw new Error("Pretty Formatter got unknown EvaluationDirection: " + evaluationDirection);
    }
}
function prettyColourStyle(colourPalette: ColourPalette): string {
    switch (colourPalette) {
        case ColourPalette.RB:
            return "Red-Blue";
        case ColourPalette.GB:
            return "Green-Blue";
        default:
            throw new Error("Pretty Formatter got unknown ColourStyle: " + colourPalette);
    }
}
function prettyCurveInterpolation(curveInterpolation: CurveInterpolation): string {
    switch (curveInterpolation) {
        case CurveInterpolation.LINEAR:
            return "Linear";
        case CurveInterpolation.CATMULLROM:
            return "Catmull-Rom";
        case CurveInterpolation.STEP:
            return "Step";
        default:
            throw new Error("Pretty Formatter got unknown CurveInterpolation: " + curveInterpolation);
    }
}
function prettyOperator(operator: Operator): string {
    switch (operator) {
        case Operator.START_WITH:
            return "Starts with";
        case Operator.END_WITH:
            return "Ends with";
        case Operator.CONTAIN:
            return "Contains";
        case Operator.EQUAL:
            return "Equals";
        case Operator.SEMANTIC_EQUAL:
            return "Semantically Equals";
        case Operator.ENTAIL:
            return "Entails";
        case Operator.CONTRADICT:
            return "Contradicts";
        default:
            throw new Error("Pretty Formatter got unknown Operator: " + operator);
    }
}
function prettyAssignmentPreset(assignmentPreset: AssignmentPreset): string {
    switch (assignmentPreset) {
        case AssignmentPreset.NONE:
            return "None";
        case AssignmentPreset.WORD:
            return "Word";
        case AssignmentPreset.SENTENCE:
            return "Sentence";
        case AssignmentPreset.PARAGRAPH:
            return "Paragraph";
        default:
            throw new Error("Pretty Formatter got unknown AssignmentPreset: " + assignmentPreset);
    }
}
function prettyTemplatePreset(templatePreset: TemplatePreset): string {
    switch (templatePreset) {
        case TemplatePreset.NONE:
            return "None";
        case TemplatePreset.QA:
            return "Question Answering";
        case TemplatePreset.QA_WITH_OPTIONS:
            return "QA with Options";
        case TemplatePreset.QA_WITH_CONTEXT:
            return "QA with Context";
        case TemplatePreset.SENTIMENT:
            return "Sentiment Analysis";
        default:
            throw new Error("Pretty Formatter got unknown TemplatePreset: " + templatePreset);
    }
}
function prettyUsageMode(usageMode: UsageMode): string {
    switch (usageMode) {
        case UsageMode.STANDARD:
            return "Standard";
        case UsageMode.STUDY_P1:
            return "Study (Creating Explanations)";
        case UsageMode.STUDY_P2:
            return "Study (Comparing Explanations)";
        default:
            throw new Error("Pretty Formatter got unknown UsageMode: " + usageMode);
    }
}
function prettyModelToExplain(model: ModelToExplain): string {
    switch (model) {
        case ModelToExplain.GPT35_turbo:
            return "GPT-3.5 turbo";
        case ModelToExplain.GPT4o:
            return "GPT-4o";
        case ModelToExplain.GPT4o_mini:
            return "GPT-4o mini";
        case ModelToExplain.GPT41:
            return "GPT-4.1";
        case ModelToExplain.GPT41_mini:
            return "GPT-4.1 mini";
        case ModelToExplain.GPT41_nano:
            return "GPT-4.1 nano";
        default:
            throw new Error("Pretty Formatter got unknown ModelToExplain: " + model);
    }
}
export function prettyEnumTable(enumClass: any, enumKey: string): string {
    switch (enumClass) {
        case AssignmentDisplayType:
            return prettyAssignmentDisplayType(enumKey as AssignmentDisplayType);
        case EvaluationDirection:
            return prettyEvaluationDirection(enumKey as EvaluationDirection);
        case ColourPalette:
            return prettyColourStyle(enumKey as ColourPalette);
        case CurveInterpolation:
            return prettyCurveInterpolation(enumKey as CurveInterpolation);
        case ModelToExplain:
            return prettyModelToExplain(enumKey as ModelToExplain);
        case Operator:
            return prettyOperator(enumKey as Operator);
        case AssignmentPreset:
            return prettyAssignmentPreset(enumKey as AssignmentPreset);
        case TemplatePreset:
            return prettyTemplatePreset(enumKey as TemplatePreset);
        case UsageMode:
            return prettyUsageMode(enumKey as UsageMode);
        default:
            throw new Error("Unknown enumClass: " + enumClass);
    } 
}
export interface DropDownOption {
    key: string;
    value: string;
}

export function getEnumOptions(enumClass: any): Array<DropDownOption>  {
    const options: Array<DropDownOption> = [];

    for (let enumCase of Object.keys(enumClass)) {
        options.push({
            key: enumCase,
            value: prettyEnumTable(enumClass, enumCase),
        });
    }

    return options;
};