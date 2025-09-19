export enum AssignmentDisplayType {
    LINETHICKNESS = "LINETHICKNESS",
    LINEHEIGHT = "LINEHEIGHT",
    LINECONNECTOR = "LINECONNECTOR",
    NUMBERBLOCKS = "NUMBERBLOCKS",
    GLYPHBLOCKS = "GLYPHBLOCKS",

}
export enum EvaluationDirection {
    DELETION = "DELETION",
    INSERTION = "INSERTION",
}

export enum ColourPalette {
    RB = "RB",
    GB = "GB",
}
export enum CurveInterpolation {
    LINEAR = "LINEAR",
    CATMULLROM = "CATMULLROM",
    STEP = "STEP",
}
export enum Operator {
    START_WITH = "START_WITH",
    END_WITH = "END_WITH",
    EQUAL = "EQUAL",
    CONTAIN = "CONTAIN",
}
export interface DisplaySettings {
    assignmentDisplayType: AssignmentDisplayType;
    colourPalette: ColourPalette;
    curveInterpolation: CurveInterpolation;
}