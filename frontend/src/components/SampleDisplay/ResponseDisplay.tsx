import ReactMarkdown from "react-markdown";

interface ResponseDisplayProps {
    modelResponses? : string[];
}
const ResponseDisplay = (props:ResponseDisplayProps) => {
    const modelResponses = props.modelResponses;
    let responseString = "";
    if (modelResponses === undefined || modelResponses === null) {
        responseString = "No response from model given";
    } else if (modelResponses.length === 0) {
        responseString = "No response from model given";
    } else if (modelResponses.length === 1) {
        responseString = modelResponses[0];
    } else if (modelResponses.length === 2) {
        responseString ="**Response**: "+modelResponses[0]+"\n---\n\n";
        const scalar = parseFloat(modelResponses[1]);
        if (isNaN(scalar)) {
            responseString += "**Additional Response**: "+modelResponses[1];
        } else {
            responseString += "**Numerical Evaluation**: "+scalar.toFixed(2);
        }
    } else {
        for (let i = 0; i < modelResponses.length-1; i++) {
            responseString += "**Response "+(i+1)+"**: ";
            responseString += modelResponses[i];
            responseString += "\n---\n\n";
        }
        const scalar = parseFloat(modelResponses[modelResponses.length - 1]);
        if (isNaN(scalar)) {
            responseString += "**Response " + (modelResponses.length) + "**: " + modelResponses[modelResponses.length - 1];
        } else {
            responseString += "**Numerical Evaluation**: " + scalar.toFixed(2);
        }

    }
    return (
        <div className="flex-1 mt-3 max-h-[25rem] overflow-y-scroll p-2 border-2 border-black rounded-lg text-left">
            <ReactMarkdown children={responseString} />
            {/* <textarea className="w-full h-full p-2 border-2 border-black rounded-lg resize-none focus:outline-none no-scrollbar" value={responseString} readOnly={true}></textarea> */}
        </div>
    )
}
export default ResponseDisplay;