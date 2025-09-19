import * as React from "react";
import { createRender, useModelState } from "@anywidget/react";
import "./widget.css";
import "./output.css";
import { scheduleGroupsPresentInSpan } from "./services/GroupedTextUtils";
import AttributedText from "./AttributedTextDisplay/AttributedText";
import AttributionChart from "./AttributedTextDisplay/AttributionChart";
import { Operator, EvaluationDirection } from "./datatypes/settings";

const render = createRender(() => {
	const inputSegments = useModelState("inputSegments")[0] as string[]
	const attributions = useModelState("attributions")[0] as number[];
	const assignments = useModelState("assignments")[0] as number[];
	let sampleName = useModelState("sampleName")[0] as string | undefined;
	if (sampleName === undefined || sampleName === null || sampleName === "") {
		sampleName = "Unnamed Sample";
	}
	const scheduleValues = scheduleGroupsPresentInSpan(assignments)
	const spans = scheduleValues[0]
	const schedule = scheduleValues[1]
	const exampleObject = {
		task: {
			inputSegments: inputSegments,
			template: "",
			target: "",
			operator: Operator.CONTAIN,
		},
		attributions: attributions,
		group_assignments: assignments,
		sample_id: "0",
		sample_name: sampleName,
		direction: EvaluationDirection.DELETION,
		n_samples_generated: 1,
		execution_time: 1,
	}

	return (
		<>
		<div className="w-full flex flex-row gap-3 text-black text-lg justify-between">
			  <AttributedText
				  sampleIndex={0}
				  groupAttributions={exampleObject}
				  spans={spans}
				  groupSchedules={schedule}
			  />
			  <AttributionChart groupAttributions={exampleObject}/>
		  </div>
		</>
		
	);
});

export default { render };
