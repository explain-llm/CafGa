import * as React from "react";
import { createRender, useModelState } from "@anywidget/react";
import "./output.css";
import { Operator, EvaluationDirection } from "./datatypes/settings";
import EditPage from "./EditPage/EditPage";

const render = createRender(() => {
	const inputSegments = useModelState("inputSegments")[0] as string[]
	const assignmentsModel = useModelState("assignments");
	const initialAssignments = assignmentsModel[0] as number[];
	const directionModel = useModelState("direction");
	const sampleNameModel = useModelState("sampleName");
	// newAssignments[1]([0, 2]);
	const task = 
		 {
			inputSegments: inputSegments,
			template: "",
			target: "",
			operator: Operator.CONTAIN,
		};
	const handleSend = (assignments: number[], direction:string, sampleName:string | null) => {
		console.log("Send", assignments, direction, sampleName);
		assignmentsModel[1](assignments);
		directionModel[1](direction);
		sampleNameModel[1](sampleName);
	}
	return (
		<div className="w-4xl flex flex-row gap-3 text-black text-lg justify-between" style={{height: "fit-content", marginBottom : "10px", marginTop: "5px"}}>
			<EditPage task={task} handleSend={handleSend} />
		</div>
		
	);
});

export default { render };
