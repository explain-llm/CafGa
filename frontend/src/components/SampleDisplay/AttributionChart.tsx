import { Explanation } from "../../datatypes/network";
import {collectGroups} from "../../services/GroupedTextUtils";
import { getAttributionColour } from "../../services/color";
import { BarChart} from '@mui/x-charts';

interface AtttributionChartProps {
  explanation: Explanation;
}
const numShownChars = 8;
const cutOff = 10;
const cutOffValue = 0.05;

function assignColours(attributions: any) {
    const colours: string[] = [];
    for (const key in attributions) {
        colours.push(getAttributionColour(attributions[key]));
    }
    return colours;
}

const AttributionChart = (props: AtttributionChartProps) => {

    const attributionObject = props.explanation;
    let collectedGroups = collectGroups(attributionObject.task.inputSegments, attributionObject.group_assignments);
    const attributions = attributionObject.attributions;
    let numSegments = collectedGroups.length;
    let newIndexToOldIndex = null;
    if (numSegments > cutOff){
        // Filter out the groups that have a low absolute attribution value to reduce clutter.
        const filteredGroups = [];
        newIndexToOldIndex = new Map<number,number>(); 
        let newIndex = 0
        for (let i = 0; i < collectedGroups.length; i++) {
            if (Math.abs(attributions[i]) >= cutOffValue) {
                filteredGroups.push(collectedGroups[i]);
                newIndexToOldIndex.set(newIndex,i);
                newIndex++;
            }
        }
        collectedGroups = filteredGroups;
        numSegments = collectedGroups.length;

    }
    for (let i = 0; i < collectedGroups.length; i++) {
        collectedGroups[i] = collectedGroups[i].replace(/\s+/g, ' ').trim();
    }
    let chartHeight = numSegments * 25 + 15;
    if (chartHeight < 160) {
        chartHeight = 160;
    }
    const tickSize = 0.1;
    const numTicks = Math.floor(1/tickSize);

    const tickArray = new Array(2*numTicks+1).fill(0)
    let curVal = -1;
    for (let i = 0; i < 2*numTicks+1; i++) {
        tickArray[i] = curVal.toFixed(1);
        curVal += tickSize;
    }
    // Need to handle groups that have the same text. Because having the same x-label will mess up the chart.
    const seenText = new Map<string,number>();
    let numOccurences;
    for (let i = 0; i < collectedGroups.length; i++) {
        if (seenText.has(collectedGroups[i]) ) {
            numOccurences = seenText.get(collectedGroups[i]);
            let buffer = "";
            if (numOccurences === undefined) {
                continue;
            }
            for (let j = 0; j < numOccurences; j++) {
                buffer += " ";
            }
            collectedGroups[i] = collectedGroups[i] + buffer;
            seenText.set(collectedGroups[i],numOccurences+1);
        } else {
            seenText.set(collectedGroups[i],1);
        }
    }
    let attributionsCopy;
    if (newIndexToOldIndex !== null) {
        attributionsCopy = new Array(collectedGroups.length).fill(0);
        for (let i = 0; i < collectedGroups.length; i++) {
            attributionsCopy[i] = attributions[newIndexToOldIndex.get(i)!];
        }
    } else {
        attributionsCopy = structuredClone(attributions);
    }
    const dataset = collectedGroups.map((group, index) => { return { x: group , y: attributionsCopy[index]}}); 
    dataset.sort((a,b) => b.y - a.y);
    // Need to copy since all other references point to this array and sorting it will mess up the order.
    attributionsCopy.sort((a,b) => b - a);
    const colors = assignColours(attributionsCopy);
    const handleLabel = (v: string,context: any) => {
        if (context.location === 'tick') {
            const axisString = v.substring(0, numShownChars) + (v.length > numShownChars ? "..." : "");
            return axisString;
        } else {
            return v;
        }
    }
    
    return (
        <div className="rounded-lg border-neutral-600 p-2 gap-2" style={{ height: `${chartHeight}px`}}>
            {newIndexToOldIndex !== null && <p className="text-xs text-slate-600">Absolute values below {cutOffValue} have been filtered out.</p>}
             <BarChart
                dataset={dataset}
                xAxis={[{id : 'x-axis', scaleType: 'linear', tickInterval: tickArray, min: -1, max: 1}]}
                yAxis={[{ dataKey: 'x', scaleType: 'band',
                    valueFormatter: (v: string,context) => handleLabel(v,context),
                    tickLabelStyle: {
                        fontSize: 12,
                        textAnchor: 'start',
                        transform: 'translateX(-60px)',
                    },
                    colorMap:{
                    type: 'ordinal',
                    colors: colors
                    }
                }] }
                series={[{xAxisId: 'x-axis', dataKey: 'y'}]}
                layout="horizontal"
                grid={{ vertical: true }}
                margin={{
                    top: 10,
                    left: 80,
                    bottom: 70,
                  }}
                height={chartHeight}
            />
        </div>
    );
}
export default AttributionChart;