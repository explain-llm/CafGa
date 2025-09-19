import { axiosClient } from '../apiClient';
import { Node } from '../../datatypes/tree';
import { makeTreeSerializable } from '../../services/tree';
import { Explanation, SampleHistory, Task } from '../../datatypes/network';


export function getSampleHistory() : Promise<SampleHistory>{
    const promise = axiosClient.get<SampleHistory>('groupedText/history');
    return promise.then(res => {
        return res.data;
    })
    .catch(err => {
        console.error(err);
        throw err;
    });

}
export function postParseAndPredictRequest(unparsed_input:string, task: Task) {
    const requestBody =  {unparsed_input: unparsed_input, task: task};
    task.originalPrediction = null;
    task.predefinedEditHierarchy = {
        children: [],
        nodeId: "dummy",
        parent: null,
        textIds: [],
    }; // This is a dummy value that will be replaced by the backend
    const promise = axiosClient.post<Task>('/groupedText/parse', requestBody);
    return promise.then(res => {
        return res.data;
    })
    .catch(err => {
        console.error(err);
        throw err;
    });
}
export function postAttributionEvaluationRequest(
    task: Task,
    assignments: number[],
    direction: string,
    edit_hierarchy: Node,
    sample_name: string | null,
    modelToExplain: string 

) {
    
    if (task.predefinedEditHierarchy !== undefined && task.predefinedEditHierarchy !== null) {
        makeTreeSerializable(task.predefinedEditHierarchy);
    } else {
        task.predefinedEditHierarchy = {
            children: [],
            nodeId: "dummy",
            parent: null,
            textIds: [],
        }
    }
    makeTreeSerializable(edit_hierarchy);
    if (task.originalPrediction === undefined) {
        task.originalPrediction = null;
    }
    const requestBody = {
        task: task, 
        assignments: assignments,
        direction: direction,
        edit_hierarchy: edit_hierarchy,
        sample_name: sample_name,
        model_to_explain: modelToExplain
    }
    const promise = axiosClient.post<Explanation>('/groupedText/attribute', requestBody);
    
    return promise.then(res => {
        return res.data;
    })
    .catch(err => {
        console.error(err);
        throw err;
    });
}
export function deleteAllSamples() {
    const promise = axiosClient.delete('/groupedText/history');
    return promise.then(res => {
        return res.data;
    })
    .catch(err => {
        console.error(err);
        throw err;
    });
}
export function deleteSample(sample_id: string) {
    const promise = axiosClient.delete('/groupedText/', {
        params:{
            sample_id: sample_id
        }
    });
    return promise.then(res => {
        return res.data;
    })
    .catch(err => {
        console.error(err);
        throw err;
    });
}