import { useState, useEffect } from "react";
import { IoInformation } from "react-icons/io5";
import { IoMdCloudUpload } from "react-icons/io";
import { createIndexSchuffle } from "../../services/util";
import { Explanation } from "../../datatypes/network";
import { ExplanationMethod, ComparisonResult } from "../../datatypes/study";
import { getExplanationComparisonArray, postComparisonStudyResults } from "../../router/resources/study";
import ComparisonGuidance from "./ComparisonGuidance";
import Button from "../auxiliary/Button";
import ComparisonView from "./ComparisonView";
import SubmissionScreen from "./SubmissionScreen";
import FinishedScreen from "./FinishedScreen";
// interface ExplanationComparisonProps {

// }

const originalIndexToMethod =[
    ExplanationMethod.HUMAN,
    ExplanationMethod.MEXGEN,
    ExplanationMethod.PSHAP,
]
const ExplanationComparison = () => {
    const numComparisons = 10;
    const initialVisitedIndices = new Array<boolean>(numComparisons).fill(false);
    initialVisitedIndices[0] = true;
    const initalFavourites = Array(numComparisons).fill(0);
    const [started, setStarted] = useState<boolean>(false);
    const [showGuidance, setShowGuidance] = useState<boolean>(true);
    const [showSubmission, setShowSubmission] = useState<boolean>(false);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [loadingExplanations, setLoadingExplanations] = useState<boolean>(true);
    const [creatorUserIds, setCreatorUserIds] = useState<string[]>([]);
    const [explanationComparisonArray, setExplanationComparisonArray] = useState<Explanation[][]>([]);
    const [favourites, setFavourites] = useState<number[]>(initalFavourites);
    const [indexShuffles, setIndexShuffles] = useState<number[][]>([]);
    const [visitedIndeces, setVisitedIndices] = useState<boolean[]>(initialVisitedIndices);
    useEffect(() => {
        console.log("Fetching explanations");
        getExplanationComparisonArray(numComparisons).then((res) => {
        const comparableExplanationsArray = res.explanationComparisonArray;
        const newExplanationComparisonArray = new Array<Explanation[]>(comparableExplanationsArray.length);
        const newIndexShuffles = new Array<number[]>(numComparisons);
        const newCreatorUserIds = Array.from({length: numComparisons}, (_, i) => comparableExplanationsArray[i][0].userId);
        setCreatorUserIds(newCreatorUserIds);
        let n_explanations;
        let indexShuffle;
        for (let i = 0; i < comparableExplanationsArray.length; i++){
            const explanations = new Array<Explanation>(comparableExplanationsArray[i].length);
            n_explanations = comparableExplanationsArray[i].length;
            indexShuffle = createIndexSchuffle(n_explanations);
            for (let j = 0; j < comparableExplanationsArray[i].length; j++){
                
                explanations[indexShuffle[j]] = comparableExplanationsArray[i][j].explanation;

            }
            newExplanationComparisonArray[i] = explanations;
            newIndexShuffles[i] = indexShuffle;
        }
        
        setLoadingExplanations(false);
        setExplanationComparisonArray(newExplanationComparisonArray);
        setIndexShuffles(newIndexShuffles);
    });
    }, []);
    const handleExitGuidance = () => {
        setStarted(true);
        setShowGuidance(false);
    }
    const handleUpdatedVisited = (visitedIndex: number) => {
        const newVisitedIndices = [...visitedIndeces];
        newVisitedIndices[visitedIndex] = true;
        setVisitedIndices(newVisitedIndices);
    }
    const handleUpdateFavourites = (comparisonIndex: number, explanationIndex: number) => {
        const newFavourites = [...favourites];
        newFavourites[comparisonIndex] = explanationIndex;
        setFavourites(newFavourites);
    }
    const handleExitSubmission = () => {
        setShowSubmission(false);
    }
    const handleSubmission = () => {
        let originalIndexOfFavourite;
        let preferredMethod;
        let indexShuffle;
        let favourite;
        let humanIndex;
        const comparisonStudyResults = new Array<ComparisonResult>(numComparisons);
        for (let i = 0; i < numComparisons; i++){
            indexShuffle = indexShuffles[i];
            favourite = favourites[i];
            originalIndexOfFavourite = indexShuffle.indexOf(favourite);
            humanIndex = indexShuffle[0]; // Only human expl. has the correct task id
            preferredMethod = originalIndexToMethod[originalIndexOfFavourite];
            comparisonStudyResults[i] = {
                preferredMethod: preferredMethod as ExplanationMethod,
                userId: creatorUserIds[i],
                taskId: explanationComparisonArray[i][humanIndex].task.taskId!,
            }
        }
        const response = postComparisonStudyResults({comparisonResults: comparisonStudyResults});
        response.then(() => {
            setSubmitted(true);
        })
    }

    return (
        <div className="flex flex-col fixed bottom-0 left-0 right-0 top-0 bg-ghost-white px-[3rem] py-6 justify-center items-center">
            {!submitted && started && <div>
                <div className="absolute top-2 right-2 flex flex-col gap-2 w-fit">
                    <Button onClick={() => setShowGuidance(true)} order={5} noTextPaddings={true}><IoInformation size={22}/></Button>
                    <Button onClick={() => setShowSubmission(true)} order={5} noTextPaddings={true}><IoMdCloudUpload size={22}/></Button>
                </div>
                {!loadingExplanations && <ComparisonView explanationComparisonArray={explanationComparisonArray} handleUpdatedVisited={handleUpdatedVisited} handleUpdateFavourites={handleUpdateFavourites}/>}
            </div>}
            {showGuidance && !submitted && <ComparisonGuidance handleContinue={handleExitGuidance} />}
            {showSubmission && !submitted && <SubmissionScreen visited={visitedIndeces} handleSubmission={handleSubmission} handleExit={handleExitSubmission} />}
            {submitted && <FinishedScreen />}
            

        </div>
    );
}

export default ExplanationComparison;