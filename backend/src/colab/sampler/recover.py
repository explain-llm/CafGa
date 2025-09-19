import re
import sacremoses

from src.colab.utils.set import and_join

detokenizer = sacremoses.MosesDetokenizer(lang="en").detokenize


def recover_passage(
    spec,
    subset=None,
    template=None,
):
    nodes = spec["nodes"]
    span_dict = {span["id"]: span for span in spec["spans"]}
    # print("Span dict: ", span_dict)

    def get_node(x):
        return nodes[x]

    roots = [i for i, node in enumerate(nodes) if node.get("parent") == None]
    sents = [
        recover_text_from_node(
            span_dict=span_dict, get_node=get_node, root_id=root_id, subset=subset
        )
        for root_id in roots
    ]
    for i, sent in enumerate(sents):
        if sent is None:
            continue
        if sent.endswith(" ."):
            sents[i] = sent[:-2] + "."
        elif sent.endswith(" "):
            sents[i] = sent[:-1] + "."
        elif sent.endswith("."):
            continue
        else:
            sent += "."

    input = " ".join([sent for sent in sents if sent is not None])
    if template is None:
        return input
    else:
        return template.format(input=input)


def recover_text_from_node(
    span_dict,
    get_node,
    root_id,
    subset=None,
    check_necessity=True,
):
    node = get_node(root_id)
    if node.get("value") is not None:
        return node.get("value")
    if subset is not None and node["id"] not in subset:
        return None

    data = node["data"]
    type = data.get("type")
    spans = data.get("spans")
    comp_rule = data.get("comp_rule")
    comp_param = data.get("comp_param")

    if type == "span":
        return span_dict[spans[0]]["text"]

    text = []
    for child in node["children"]:
        if child["type"] == "span":
            text.append(span_dict[child["id"]]["text"])
        else:
            child_node = get_node(child["id"])
            child_text = recover_text_from_node(
                span_dict,
                get_node,
                child["id"],
                subset=None if node.get("collapsed") else subset,
                check_necessity=check_necessity,
            )
            if child_text is None:
                if check_necessity and child_node["data"].get("necessary"):
                    text = None
                    break
            else:
                text.append(child_text)
    if text is None:
        return None

    if comp_rule == "CONJ":
        if comp_param == "AND":
            return and_join(text)
        else:
            raise NotImplementedError

    elif comp_rule == "CONCAT":
        return "".join(text)
    else:
        raise ValueError()
