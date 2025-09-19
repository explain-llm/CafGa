import React from "react";
import "../output.css";
import { GroupAttributionResponse } from "../datatypes/network";
import {collectGroups} from "../services/GroupedTextUtils";
import { getAttributionColour } from "../services/color";
import { BarChart} from '@mui/x-charts';

interface AtttributionChartProps {
  groupAttributions: GroupAttributionResponse;
}
const numShownChars = 8;

function assignColours(attributions: any) {
    let colours: string[] = [];
    for (let key in attributions) {
        colours.push(getAttributionColour(attributions[key]));
    }
    return colours;
}

const AttributionChart = (props: AtttributionChartProps) => {

    let attributionObject = props.groupAttributions;
    let collectedGroups = collectGroups(attributionObject.task.inputSegments, attributionObject.group_assignments);
    let attributions = attributionObject.attributions;
    let numSegments = collectedGroups.length;
    let chartHeight = numSegments * 25 + 10;
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
    // const chartWidth = 450;
    // Need to handle groups that have the same text as having the same x label will mess up the chart.
    let seenText = new Map<string,number>();
    for (let i = 0; i < collectedGroups.length; i++) {
        if (seenText.has(collectedGroups[i]) ) {
            let numOccurences = seenText.get(collectedGroups[i]);
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
    let dataset = collectedGroups.map((group, index) => {return {x: group, y: attributions[index]}}); 
    dataset.sort((a,b) => b.y - a.y);
    let attributionsCopy = structuredClone(attributions); 
    // Need to copy since all other references point to this array and sorting it will mess up the order.
    attributionsCopy.sort((a,b) => b - a);
    let colors = assignColours(attributionsCopy);
    const handleLabel = (v: string,context: any) => {
        if (context.location === 'tick') {
            let axisString = v.substring(0, numShownChars) + (v.length > numShownChars ? "..." : "");
            return axisString;
        } else {
            return v;
        }
    }
    
    return (
        <div className="p-2 gap-2 w-full items-center justify-center" style={{ height: `${chartHeight}px`}}>
            <p className="font-bold text-xl text-black">Attribution Values By Group</p>
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