import { AssignmentDisplayType } from "../datatypes/settings";
import { LineCommands } from "../datatypes/network";
export function addSpaceAfterPeriods(text: string) {
    return text.replace(/\./g, '. ');
}
function includesPunctuation(text: string) {
    return text.match(/[.!?\n]/g) ? true : false;
}
function includesEndOfParagraph(text: string) {
    return text.match(/\n\n+/g) ? true : false;
}
export function findSentenceEnds(inputSegments: string[]) {
    const sentenceEnds = [];
    for (let i = 0; i < inputSegments.length; i++) {
        if (includesPunctuation(inputSegments[i])) {
            sentenceEnds.push(i);
        }
    }
    if (!includesPunctuation(inputSegments[inputSegments.length-1])) {
        // If the last segment does not end with a period, still need to add it to the list of sentence ends.
        sentenceEnds.push(inputSegments.length-1);
    }
    return sentenceEnds;
}
export function findParagraphEnds(inputSegments: string[]) {
    const paragraphEnds = [];
    for (let i = 0; i < inputSegments.length; i++) {
        if (includesEndOfParagraph(inputSegments[i])) {
            paragraphEnds.push(i);
        }
    }
    if (!includesEndOfParagraph(inputSegments[inputSegments.length - 1])) {
        // If the last segment does not end with a period, still need to add it to the list of sentence ends.
        paragraphEnds.push(inputSegments.length - 1);
    }
    return paragraphEnds;
}
export function isUnique(value: any, index: number, array: any[]) {
    return array.indexOf(value) === index;
}
export function getUniqueElements(array : number[]) {
    return array.filter(isUnique).sort((a,b) => a - b);
}
export function getNumberOfGroups(assignments: number[]) {
    return getUniqueElements(assignments).length;
}
export function standardizeAssignments(assignments: number[]) {
    const groups = getUniqueElements(assignments);
    const standardAssignments = [];
    for (let i = 0; i < assignments.length; i++){
        standardAssignments.push(groups.indexOf(assignments[i]));
    }
    return standardAssignments;
}

export function collectGroups(inputs: string[], assignments: number[]): string[] {
    const n_unique = getNumberOfGroups(assignments);
    const groups = new Array(n_unique);
    groups[assignments[0]] = inputs[0];
    let cur_segment = "";
    for (let i = 1; i < inputs.length; i++) {
        if (groups[assignments[i]] === undefined) {
            groups[assignments[i]] = inputs[i];
        } else {
            if (assignments[i] !== assignments[i-1]) {
                // Since are in else branch group was already started, but interrupted by a different group.
                // So we add "..." to show that the group was interrupted.
                cur_segment = "... "+inputs[i];
            } else {
                cur_segment = inputs[i];
            }
            groups[assignments[i]] += cur_segment;
        }
    }
    return groups;
}
function determineMidPoint(endIndex:number, curLen: number, segmentLengths: number[]) {
    // If current length is even, the middle is not defined. So, compare length of left (curMidPoint) and right (curMidPoint+1) candidate. 
    // Pick the candidate for which the input segment is longer.
    let curMidPoint = endIndex - Math.trunc(curLen/2) ;
            
    if (curLen % 2 == 0){
        // If is even middle is not defined, so compare length of left (curMidPoint) and right (curMidPoint+1) candidate. 
        // Pick the candidate for which the input segment is longer.
        if (segmentLengths[curMidPoint] < segmentLengths[curMidPoint+1]){
            curMidPoint = curMidPoint + 1;
        }
    }
    return curMidPoint;
}
export function findMidPoints(segmentLengths: number[], assignments: number[]) {
    // Find the midpoints of the continuous segments of input that all belong to the same group.
    const midPoints: number[] = [];
    let curGroup = assignments[0];
    let curLen = 1;
    for (let i = 1; i < assignments.length; i++) {
        if (assignments[i] === curGroup) {
            curLen++;
        } else {
            // We have reached the end of the current group.
            midPoints.push(determineMidPoint(i-1,curLen,segmentLengths));
            curGroup = assignments[i];
            curLen = 1;
        }
    }
    midPoints.push(determineMidPoint(assignments.length-1,curLen,segmentLengths));
    const isMidBitMap = assignments.map((_, index) => midPoints.includes(index));
    return isMidBitMap;
}
function getGroupSpans(assignments: number[]) : number[][] {
    const n_groups = getNumberOfGroups(assignments);
    const groupSpans = new Array<number[]>(n_groups);
    for (let i = 0; i < assignments.length; i++) {
        if (groupSpans[assignments[i]] === undefined) {
            groupSpans[assignments[i]] = [i,i];
        } else {
            groupSpans[assignments[i]][1] = i;
        }
    }
    return groupSpans;
}
function inInterval(value: number, interval: number[]) {
    return value >= interval[0] && value <= interval[1];
}
function isConflict(interval1: number[], interval2: number[]) {
    return inInterval(interval1[0], interval2) || inInterval(interval1[1], interval2) || inInterval(interval2[0], interval1) || inInterval(interval2[1], interval1);
}
function getConflicts(spans: number[][]) : number[][] {
    const conflicts = new Array<number[]>(spans.length);
    for (let i = 0; i < spans.length; i++) {
        conflicts[i] = [];
        for (let j = 0; j < spans.length; j++) {
            // Allow i == j to conflict with itself so that get it at the right time in the queue.
            if (isConflict(spans[i], spans[j])) {
                conflicts[i].push(j);
            }
        }
    }
    return conflicts;
}
export function scheduleGroupsPresentInSpan(assignments: number[]) : [number[][], number[][]] {
    // The values in the schedule work as follows:
    // 0 -> solid line
    // 1 -> dashed line
    // 2 -> hidden line
    const spans = getGroupSpans(assignments);
    const conflicts = getConflicts(spans);
    const groupSchedules = new Array<number[]>(assignments.length);
    let schedule;
    let curGroup;
    let activeGroups;
    for (let i = 0; i < assignments.length; i++) {
        schedule = [];
        curGroup = assignments[i];
        activeGroups = [];
        for(let j = 0; j < spans.length; j++) {
            if (inInterval(i, spans[j])) {
                activeGroups.push(j);
            }
        }
        for (const actvieGroup of activeGroups) {
            // For each group that is currently active in the span
            for (const conflictGroup of conflicts[actvieGroup]) {
                // If there is a group that starts earlier and has a conflict with the current group, but is no longer active add a hidden line.
                if (!activeGroups.includes(conflictGroup) && spans[conflictGroup][0] <= spans[actvieGroup][0]) {
                    schedule.push(2);
                }
            }
            // Then add the line for the active group (solid if this is the group the text segment (time step) we are at, dashed otherwise)
            if (actvieGroup == curGroup) {
                schedule.push(0);
            } else {
                schedule.push(1);
            }
        }
        groupSchedules[i] = schedule;
    }
    return [spans, groupSchedules];
}
export function getGroupSizeAsPercentage(assignments: number[]) {
    const numGroups = getNumberOfGroups(assignments);
    const totalSize = assignments.length;
    const groupSizes = new Array<number>(numGroups);
    groupSizes.fill(0);
    for (let i = 0; i < assignments.length; i++) {
        groupSizes[assignments[i]]++;
    }
    return groupSizes.map((value) => value/totalSize);
}
export function getAttributionRankOrder(attributions: number[]) {
    const sortedIndices = attributions.map((_, index) => index).sort((a,b) => attributions[b] - attributions[a]);
    return sortedIndices;
}

export function deriveLineCommands(index: number, assignments: number[], assignmentDisplayType: AssignmentDisplayType, spans?:number[][], groupSchedules?:number[][]): LineCommands {
    const isFirst = index == 0;
    const isLast = index == assignments.length - 1;
    let breakLeft = false;
    let breakRight = false;
    let interruptLeft = false;
    let interruptRight = false;
    let groupSchedule: number[] = [];
    if (index == 0 || assignments[index] !== assignments[index - 1]) {
        interruptLeft = true;
    }
    if (index == assignments.length - 1 || assignments[index] !== assignments[index + 1]) {
        interruptRight = true;
    }
    if (assignmentDisplayType === AssignmentDisplayType.LINECONNECTOR && spans && groupSchedules) {
        breakLeft = spans[assignments[index]][0] === index;
        breakRight = spans[assignments[index]][1] === index;
        groupSchedule = groupSchedules[index];
    } else {
        // Display types other than line connector do not need the group schedule and break lines differently.
        breakLeft = interruptLeft;
        breakRight = interruptRight;
    }

    const lineCommands: LineCommands = { isFirst, isLast, breakLeft, breakRight, interruptLeft, interruptRight, groupSchedule };
    return lineCommands;
}