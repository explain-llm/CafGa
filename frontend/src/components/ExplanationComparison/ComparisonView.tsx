import { useState } from "react";
import { Explanation } from "../../datatypes/network"
import { modulus } from "../../services/util";

import SampleDisplay from "../SampleDisplay/SampleDisplay";
import Button from "../auxiliary/Button";
interface ComparisonViewProps {
    explanationComparisonArray: Explanation[][];
    handleUpdateFavourites: (comparisonIndex : number, explanationIndex : number) => void;
    handleUpdatedVisited: (visitedIndex: number) => void;
}

const ComparisonView = (props: ComparisonViewProps) => {
    const explanationComparisonArray = props.explanationComparisonArray;
    const numComparisons = explanationComparisonArray.length;
    const initalFavourites = Array(numComparisons).fill(0);
    const [currentComparisonIndex, setCurrentComparisonIndex] = useState<number>(0);
    const [favourites, setFavourites] = useState<number[]>(initalFavourites);
    const handleMoveNext = () => {
        const newIndex = modulus(currentComparisonIndex + 1, numComparisons);
        setCurrentComparisonIndex(newIndex);
        props.handleUpdatedVisited(newIndex);
    }
    const handleMovePrevious = () => {
        const newIndex = modulus(currentComparisonIndex - 1, numComparisons);
        setCurrentComparisonIndex(newIndex);
        props.handleUpdatedVisited(newIndex);
    }
    const handleUpdateFavourite = (explanationIndex: number) => {
        const newFavourites = [...favourites];
        newFavourites[currentComparisonIndex] = explanationIndex;
        props.handleUpdateFavourites(currentComparisonIndex, explanationIndex);
        setFavourites(newFavourites);
    }
    return (
        <div className="flex flex-col gap-2 items-center justify-center">
            <div className="flex flex-col max-h-[85vh] overflow-y-auto no-scrollbar">
                {explanationComparisonArray[currentComparisonIndex].map((explanation, index) => {
                    return (
                        <div key={index} className="flex flex-row items-center justify-center gap-4">
                            <div className="w-5/6">
                                <SampleDisplay
                                    key={index}
                                    explanation={explanation}
                                    sampleIndex={index}
                                    disableSubmission={true}
                                    suppressEvaluationDirectionWarning={true}
                                    hideName={true}
                                />
                            </div>
                            <input type="radio" className="size-7" checked={index==favourites[currentComparisonIndex]} onChange={() => handleUpdateFavourite(index)}/>
                        </div>
                    )
                })}
            </div>
            <div className="flex flex-row justify-between items-center w-5/6">
                <Button onClick={handleMovePrevious} order={1}>Previous</Button>
                <p className="text-xl">{currentComparisonIndex+1}/{numComparisons}</p>
                <Button onClick={handleMoveNext} order={1}>Next</Button>
            </div>
        </div>
    )
}
export default ComparisonView;