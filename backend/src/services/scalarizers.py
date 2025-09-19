justify_fns = {
    "START_WITH": lambda resp, value: resp.startswith(value),
    "END_WITH": lambda resp, value: resp.endswith(value),
    "EQUAL": lambda resp, value: resp == value,
    "CONTAIN": lambda resp, value: value in resp,
}
NLI_fns = ["SEMANTIC_EQUAL", "ENTAIL", "CONTRADICT"]

def evaluate_outcome(resps : list[str], outcome : dict[str, str], NLI_model = None):
    if type(resps) is str:
        resps = [resps]

    operator = outcome["operator"]
    value = outcome["value"].lower()

    if operator in justify_fns:
        justify_fn = justify_fns[operator]
        justifications = [justify_fn(resp, value) for resp in resps]
        return sum(justifications) / len(justifications)
    elif operator in NLI_fns:
        if NLI_model is None:
            raise ValueError(f"Trying to run NLI method: {operator} but no NLI model is defined")
        NLI_predictions = []
        print("Begin NLI evaluation:")
        for resp in resps:
            prediction = NLI_model([dict(text=resp, text_pair=value)], top_k=None)
            if operator == "ENTAIL":
                for labelled_score in prediction[0]:
                    if labelled_score["label"] == "entailment":
                        NLI_predictions.append(labelled_score["score"])
            elif operator == "CONTRADICT":
                for labelled_score in prediction[0]:
                    if labelled_score["label"] == "contradiction":
                        NLI_predictions.append(labelled_score["score"])
            elif operator == "SEMANTIC_EQUAL":
                predction_backward = NLI_model([dict(text=value, text_pair=resp)], top_k=None)
                foward_score = 0.0
                for labelled_score in prediction[0]:
                    if labelled_score["label"] == "entailment":
                        foward_score = labelled_score["score"]
                for labelled_score in predction_backward[0]:
                    if labelled_score["label"] == "entailment":
                        backward_score = labelled_score["score"]
                aggregate = min([foward_score, backward_score])
                NLI_predictions.append(aggregate)
        print("NLI_predictions: ", NLI_predictions)
        return sum(NLI_predictions) / len(NLI_predictions)
    else:
        raise ValueError(f"Operator {operator} not found")
