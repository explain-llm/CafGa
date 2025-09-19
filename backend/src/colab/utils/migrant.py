from src.colab.sampler.recover import recover_text_from_node


def is_nece_span(rule):
    return rule["type"] == "span" and rule.get("necessary")


def spec2new(spec):
    # TODO: check the uniqueness
    spans = [span for sent_spec in spec for span in sent_spec["spans"]]
    span_dict = {span["id"]: span for span in spans}
    nodes = []
    for sent_spec in spec:
        nodes += rule2node(sent_spec["rule"], len(nodes))

    def get_node(x):
        return nodes[x]

    for node in nodes:
        text = recover_text_from_node(span_dict, get_node, node["id"])

        node_tokens = []
        for child in node["children"]:
            if child["type"] == "span":
                node_tokens.append(span_dict[child["id"]]["text"])
            else:
                if len(node_tokens) == 0 or node_tokens[-1] != "...":
                    node_tokens.append("...")

        node["data"].update(text=text, node_text="".join(node_tokens))

    return dict(spans=spans, nodes=nodes)


def rule2node(rule, id, parent_id=None):
    nodes = [
        dict(
            id=id,
            parent=parent_id,
            children=[],
            data={
                "spans": [],
                "type": rule.get("type"),
                "comp_rule": rule.get("comp-rule"),
                "comp_param": rule.get("comp-param"),
                "necessary": rule.get("necessary"),
            },
        )
    ]

    if rule["type"] == "span":
        nodes[0]["data"]["spans"].append(rule["id"])
        return nodes

    for span in rule["spans"]:
        if is_nece_span(span):
            nodes[0]["data"]["spans"].append(span["id"])
            nodes[0]["children"].append({"type": "span", "id": span["id"]})
        else:
            subtree = rule2node(span, len(nodes) + id, id)
            nodes[0]["data"]["spans"] += subtree[0]["data"]["spans"]
            nodes[0]["children"].append({"type": "node", "id": len(nodes) + id})
            nodes += subtree
    return nodes


def update_span_idx_from_sents(parsed_sents):
    start_id = 0
    updated_parsed_sents = []
    for sent_spec in parsed_sents:

        id_dict = [0 for _ in range(sent_spec["spans"][-1]["id"] + 1)]
        for i, span in enumerate(sent_spec["spans"]):
            id_dict[span["id"]] = i + start_id

        sent_spec["spans"] = [
            {"id": id_dict[span["id"]], "text": span["text"]} for span in sent_spec["spans"]
        ]

        sent_spec["rule"] = update_span_idx(sent_spec["rule"], id_dict)

        updated_parsed_sents.append(sent_spec)

        start_id += len(sent_spec["spans"])

    return updated_parsed_sents


def update_span_idx(node, id_dict):
    if node["type"] == "span":
        node.update(id=id_dict[node["id"]])
        return node
    else:
        node["spans"] = [update_span_idx(node, id_dict) for node in node["spans"]]
        return node


def reduce_single_child_node(node):
    if "spans" in node:
        node["spans"] = [reduce_single_child_node(child) for child in node["spans"]]
        if len(node["spans"]) == 1:
            node = {
                **node["spans"][0],
                "necessary": node.get("necessary", False)
                and node["spans"][0].get("necessary", False),
            }
    return node


def reduce_node(node):
    if not node.get("necessary", False) or node["type"] == "span" or node["comp-rule"] == "CONJ":
        return [node]

    nodes = []
    for child in node.get("spans", []):
        nodes += reduce_node(child)

    return nodes


def simplify_tree(node):

    node = reduce_single_child_node(node)

    if node["type"] == "span":
        return node

    node["spans"] = [simplify_tree(child) for child in node["spans"]]

    if node["comp-rule"] == "CONCAT":

        children = []
        for child in node["spans"]:
            children += reduce_node(child)

        node["spans"] = children

    return node
