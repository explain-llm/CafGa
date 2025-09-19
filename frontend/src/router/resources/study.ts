import { axiosClient } from '../apiClient';
import { ExplanationComparisonArrayResponse, ComparisonStudyResults, PersonalInformationPostResponse, PersonalInformationPostRequest } from '../../datatypes/study';
import { makeTreeSerializable } from '../../services/tree';
import { Explanation } from '../../datatypes/network';


export function getExplanationComparisonArray(numComparisons: number): Promise<ExplanationComparisonArrayResponse>{
    const promise = axiosClient.get<ExplanationComparisonArrayResponse>('study/explanationComparisonArray', { params: { "n_comparisons": numComparisons }});
    return promise.then(res => {
        return res.data;
    })
    .catch(err => {
        console.error(err);
        throw err;
    });

}
export function postPersonalInformation(request: PersonalInformationPostRequest): Promise<PersonalInformationPostResponse>{
    const promise = axiosClient.post<PersonalInformationPostResponse>('study/personalInformation', request);
    return promise.then(res => {
        return res.data;
    }
    )
    .catch(err => {
        console.error(err);
        throw err;
    }
    );
}
export function postExplanation(explanation: Explanation): Promise<void>{
    makeTreeSerializable(explanation.edit_hierarchy);
    const promise = axiosClient.post<void>('study/submitExplanation', explanation);
    return promise.then(() => {
        return;
    })
    .catch(err => {
        console.error(err);
        throw err;
    });
}
export function postComparisonStudyResults(comparisonResults: ComparisonStudyResults): Promise<void>{
    const promise = axiosClient.post<void>('study/results', comparisonResults);
    return promise.then(() => {
        return;
    })
    .catch(err => {
        console.error(err);
        throw err;
    });
}