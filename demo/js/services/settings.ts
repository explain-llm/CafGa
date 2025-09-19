import {
    AssignmentDisplayType,
    DisplaySettings,
    EvaluationDirection,
    ColourPalette,
    CurveInterpolation,
    Operator,
} from '../datatypes/settings';

const LOCAL_STORAGE_SETTINGS_KEY: string = 'settings';

export const DEFAULT_SETTINGS: DisplaySettings = {
    assignmentDisplayType: AssignmentDisplayType.LINECONNECTOR,
    colourPalette: ColourPalette.RB,
    curveInterpolation: CurveInterpolation.LINEAR,
};

export function getSettings(): DisplaySettings {
    let settingsString = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
    if (settingsString === null) {
        persistSettings(DEFAULT_SETTINGS);
        return DEFAULT_SETTINGS;
    }

    return JSON.parse(settingsString!) as DisplaySettings;
}

export function persistSettings(newSettings: DisplaySettings): void {
    let settingsString = JSON.stringify(newSettings);
    localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, settingsString);
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
        default:
            throw new Error("Pretty Formatter got unknown Operator: " + operator);
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
        case Operator:
            return prettyOperator(enumKey as Operator);
        default:
            throw new Error("Unknown enumClass: " + enumClass);
    } 
}
export interface DropDownOption {
    key: string;
    value: string;
}

export function getEnumOptions(enumClass: any): Array<DropDownOption>  {
    let options: Array<DropDownOption> = [];

    for (let enumCase of Object.keys(enumClass)) {
        options.push({
            key: enumCase,
            value: prettyEnumTable(enumClass, enumCase),
        });
    }

    return options;
};