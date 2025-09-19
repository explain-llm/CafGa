import { Explanation } from "../../datatypes/network";
import { EvaluationDirection } from "../../datatypes/settings";
import { getGroupSizeAsPercentage, getAttributionRankOrder } from "../../services/GroupedTextUtils";
import { CurveInterpolation } from "../../datatypes/settings";
import {getSettings} from "../../services/settings";
import { sampleColorTable } from "../../services/color";
import { BarChart } from "@mui/x-charts";
interface DifferenceAreaChartProps {
    groupAttributionsList: Explanation[];
}
function getAreaLinear(orderedPercentages: number[], differences: number[], isDeletion: boolean) {
    // Uses the trapezoidal rule to calculate the area under the curve for linear interpolation.
    let area = 0;
    let prevDiff = 0;
    if (!isDeletion) {
        prevDiff = 1;
    }
    let averageHeight = 0;
    for (let i = 0; i < differences.length; i++) {
        averageHeight =(prevDiff + differences[i])/2;
        area += orderedPercentages[i] * averageHeight; 
        // console.log("At step ",i," Area: ", area);
        prevDiff = differences[i];
    }
    return area;
}
function getAreaStep(orderedPercentages: number[], differences: number[], isDeletion: boolean) {
    // Calculate the area under the curve for step interpolation.
    let area = 0;
    let prevDiff = 0;
    if (!isDeletion) {
        prevDiff = 1;
    }
    for (let i = 0; i < differences.length; i++) {
        area += orderedPercentages[i] * prevDiff;
        prevDiff = differences[i];
    }
    return area;
}
const DifferenceAreaChart = (props: DifferenceAreaChartProps) => {
    const numExplanations = props.groupAttributionsList.length;
    const width = 450;
    const height = 280;
    const nameCutOff = 10;
    const tickSize = 0.1;
    const numTicks = Math.floor(1/tickSize)+1;
    const ytickArray = new Array(numTicks).fill(0).map((_,index) => index*tickSize);
    const settings = getSettings();
    const curveInterpolationSetting = settings.curveInterpolation;
    let numDeletion = 0;
    let numInsertion = 0;
    for (let i = 0; i < props.groupAttributionsList.length; i++) {
        const direction = props.groupAttributionsList[i].direction;
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
    
    const differenceAreaDS= [];
    const sampleNameList : string[] = [];
    const colors : string[] = [];
    for (let i = 0; i < props.groupAttributionsList.length; i++) {
        const attributionObject = props.groupAttributionsList[i];
        if (attributionObject.differences === undefined || attributionObject.differences.length === 0) {
            return (
                <div className="text-red-600">No differences found in sample {i + 1}</div>
            );
        }
        const thisIsDeletion = attributionObject.direction === EvaluationDirection.DELETION;
        let sampleName = attributionObject.sample_name;
        if (sampleName !== null && sampleName !== undefined) {

            const sub = sampleName.substring(0, nameCutOff);
            sampleName = sampleName.length > nameCutOff ? sub + "..." : sub;
        } else {
            sampleName = numExplanations > 3 ? `Expl. ${i + 1}` : `Explanation ${i + 1}`;
        }
        sampleNameList.push(sampleName);
        colors.push(sampleColorTable[i]);
        if (thisIsDeletion !== isDeletion) {
            continue;
        }
        const groupSizeAsPercentage = getGroupSizeAsPercentage(attributionObject.group_assignments);
        const attributionRankOrder = getAttributionRankOrder(attributionObject.attributions);
        const orderedPercentages = attributionRankOrder.map((index) => groupSizeAsPercentage[index]);
        const monotonicPercentages = new Array<number>(orderedPercentages.length+1);
        monotonicPercentages[0] = 0;
        let curSum = 0;
        for (let i = 0; i < orderedPercentages.length; i++) {
            curSum += orderedPercentages[i];
            monotonicPercentages[i+1] = curSum;
        }
        monotonicPercentages[orderedPercentages.length] = 1; // Place one manually to avoid floating point errors.
        let area = 0;
        if (attributionObject.differences !== undefined) {
            switch (curveInterpolationSetting) {
                case CurveInterpolation.LINEAR:
                    area = getAreaLinear(orderedPercentages, attributionObject.differences, isDeletion);
                    break;
                case CurveInterpolation.STEP:
                    area = getAreaStep(orderedPercentages, attributionObject.differences, isDeletion);
                    break;
                default:
                    area = getAreaLinear(orderedPercentages, attributionObject.differences, isDeletion);
                    break;
            } 
        }
        differenceAreaDS.push({ x: i, y: area, name: sampleName});
        
    }
    if (isDeletion) {
        differenceAreaDS.sort((a,b) => b.y - a.y);
    } else {
        differenceAreaDS.sort((a,b) => a.y - b.y);
    }
    const sortedColors = differenceAreaDS.map((entry) => colors[entry.x]);

    return (
        <div className="" style={{ width: `${width}px`, height: `${height}px`}}>
            <p className="font-bold text-xl">Area under the Curve</p>
            <BarChart
            dataset={differenceAreaDS}
            xAxis={[{ id:'x', dataKey:'x', scaleType: 'band',
                valueFormatter: (v: number) => 
                    {return sampleNameList[v]},
                tickLabelStyle: {
                    fontSize: 12,
                    // fontWeight: 600,
                },
                colorMap:{
                type: 'ordinal',
                colors: sortedColors
                }
            
            }] }
            yAxis={[{ id: 'y', scaleType: 'linear',tickInterval:ytickArray, max : 1, min: 0}]}
            series={[{dataKey: 'y'}]}
            grid={{  horizontal: true }}
            margin={{
                top: 50,
                right: 20,
                bottom: 55, 
              }}
            width={width}
            height={height}
            />
        </div>
    );


}
export default DifferenceAreaChart;