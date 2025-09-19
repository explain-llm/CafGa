import { Explanation } from "../../datatypes/network";
import { EvaluationDirection } from "../../datatypes/settings";
import { getGroupSizeAsPercentage, getAttributionRankOrder, collectGroups } from "../../services/GroupedTextUtils";
import { LineChart } from '@mui/x-charts/LineChart';
import { CurveInterpolation } from "../../datatypes/settings";
import {getSettings} from "../../services/settings";
import { sampleColorTable } from "../../services/color";
interface DifferenceCurveProps {
    groupAttributionsList: Explanation[];
}

const DifferenceCurve = (props: DifferenceCurveProps) => {
    const numExplanations = props.groupAttributionsList.length;
    const width = 500;
    const height = 280;
    const nameCutOff = 8;
    const settings = getSettings();
    const curveInterpolationSetting = settings.curveInterpolation;
    let curveInterpolationString = "";
    switch (curveInterpolationSetting) {
        case CurveInterpolation.LINEAR:
            curveInterpolationString = "linear";
            break;
        case CurveInterpolation.CATMULLROM:
            curveInterpolationString = "catmullRom";
            break;
        case CurveInterpolation.STEP:
            curveInterpolationString = "stepAfter";
            break;
        default:
            curveInterpolationString = "linear";
            break;
    }
    // Figure out whether the perturbations are deletions or insertions.
    let numDeletion = 0;
    let numInsertion = 0;
    let direction;
    for (let i = 0; i < props.groupAttributionsList.length; i++) {
        direction = props.groupAttributionsList[i].direction;
        if (direction === EvaluationDirection.DELETION) {
            numDeletion++;
        } else if (direction === EvaluationDirection.INSERTION) {
            numInsertion++;
        }
    }
    if (numDeletion > 0 && numInsertion > 0) {
        console.warn("Conflicting perturbation directions. ");
    }
    const isDeletion = numDeletion >= numInsertion;
    const tickSize = 0.1;
    const numTicks = Math.floor(1/tickSize)+1;
    const xtickArray = new Array(numTicks).fill(0).map((_,index) => index*tickSize);
    const ytickArray = new Array(numTicks+1).fill(0).map((_,index) => index*tickSize);
    let monotonicPercentagesList = [];
    let monotonicPercentageToInputMapList= [];
    for (let i = 0; i < props.groupAttributionsList.length; i++) {
        const attributionObject = props.groupAttributionsList[i];
        if (attributionObject.differences === undefined || attributionObject.differences.length === 0) {
            return (
                <div className="text-red-600">No differences found in sample {i+1}</div>
            );
        }
        const collectedGroups = collectGroups(attributionObject.task.inputSegments,attributionObject.group_assignments);
        const groupSizeAsPercentage = getGroupSizeAsPercentage(attributionObject.group_assignments);
        const attributionRankOrder = getAttributionRankOrder(attributionObject.attributions);
        const orderedGroups = attributionRankOrder.map((index) => collectedGroups[index]);
        const orderedPercentages = attributionRankOrder.map((index) => groupSizeAsPercentage[index]);
        const monotonicPercentages = new Array<number>(orderedPercentages.length+1);
        monotonicPercentages[0] = 0;
        let curSum = 0;
        for (let i = 0; i < orderedPercentages.length; i++) {
            curSum += orderedPercentages[i];
            monotonicPercentages[i+1] = curSum;
        }
        monotonicPercentages[orderedPercentages.length] = 1; // Place one manually to avoid floating point errors.
        monotonicPercentagesList.push(monotonicPercentages);
        const percentageToInputMap = new Map<number,string>();
        for (let i = 0; i < orderedPercentages.length-1; i++) {
            percentageToInputMap.set(monotonicPercentages[i+1],orderedGroups[i]);
        }
        percentageToInputMap.set(1,orderedGroups[orderedGroups.length-1]);
        monotonicPercentageToInputMapList.push(percentageToInputMap);
    }
    const flattened = monotonicPercentagesList.flat();
    const allPercentages = flattened.filter((value,index) => flattened.indexOf(value) === index); // Remove duplicates
    allPercentages.sort((a,b) => a-b);
    let perturbedGroupListBySample = [];
    for (let i = 0; i < monotonicPercentageToInputMapList.length; i++) {
        const perturbedGroupList = [];
        let group;
        for (let j = 0; j < allPercentages.length; j++) {
            group = monotonicPercentageToInputMapList[i].get(allPercentages[j]);
            if (group === undefined) {
                perturbedGroupList.push("");
            } else {
                perturbedGroupList.push(group);
            }
        }
        perturbedGroupListBySample.push(perturbedGroupList);
        
    }
    
    let seriesList = props.groupAttributionsList.map((attributionObject,seriesIndex) => {
        let monotonicPercentages = monotonicPercentagesList[seriesIndex];
        let differences = attributionObject.differences;
        if (differences === undefined || differences.length === 0) {
            return null;
        }
        const thisIsDeletion = attributionObject.direction === EvaluationDirection.DELETION;
        if (thisIsDeletion !== isDeletion) {
            return null;
        }
        const initVal = attributionObject.direction === EvaluationDirection.DELETION ? 0 : 1;
        let differencesForCurve: (number|null)[] = [initVal];
        for (let i = 1; i < allPercentages.length; i++) {
            let closestIndex = monotonicPercentages.findIndex((value) => value == allPercentages[i]);
            if (closestIndex === -1) {
                differencesForCurve.push(null);
            } else {
                // Subtract one since we have one more element in differences than in monotonicPercentages
                // because differences does not contain a value for 0 percent.
                differencesForCurve.push(differences[closestIndex-1]); 
            }
            
        }
        let sampleName = attributionObject.sample_name;
        if (sampleName === undefined || sampleName === null) {
            sampleName = numExplanations > 3 ? `Expl. ${seriesIndex + 1}` : `Explanation ${seriesIndex + 1}`;
        } else{
            let sub = sampleName.substring(0, nameCutOff);
            sampleName = sampleName.length > nameCutOff ? sub + "..." : sub;
        }
        const valueFormatter = (_:number, indexSet: any) => {
            let group = perturbedGroupListBySample[seriesIndex][indexSet.dataIndex];
            return group;
        }
        return {
            data: differencesForCurve, label: sampleName,connectNulls: true, curve: curveInterpolationString, color: sampleColorTable[seriesIndex], valueFormatter:  valueFormatter};
    }
    )
    seriesList = seriesList.filter((series) => series !== null);
    const entriesPerLine = 4;
    const topMargin = Math.ceil(props.groupAttributionsList.length/entriesPerLine) * 30 + 5;
    

    return (
            <div className="" style={{ width: `${width}px`, height: `${height}px`}}>
                <p className="font-bold text-xl">Perturbation Curve: {isDeletion ? "Deletion": "Insertion"}</p>
                <LineChart
                xAxis={[{ data: allPercentages, scaleType: 'linear', tickInterval:xtickArray, label: "Percentage of Pertubation", labelStyle: { } }] }
                yAxis={[{ id: 'y', scaleType: 'linear', tickInterval: ytickArray, max: 1.1, min: 0, label: "Difference in Prediction", labelStyle: { transform: 'rotate(-90deg) translateX(-100px) translateY(-164px)' } }]}
                // @ts-expect-error curve does work
                series={seriesList}
                grid={{ vertical: true, horizontal: true }}
                margin={{
                    top: topMargin,
                    left: 55,
                    right: 10,
                    bottom: 70,
                  }}
                slotProps={
                    {legend:{
                        direction: 'row',
                        position: {vertical: 'top',horizontal: 'middle'},
                        itemMarkWidth: 20,
                        itemMarkHeight: 2,
                    }}
                }
                width={width}
                height={height}
                />
            </div>
    );


}
export default DifferenceCurve;