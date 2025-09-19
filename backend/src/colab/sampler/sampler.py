import random
import warnings

from colab.sampler.recover import recover_text_from_node
from colab.utils.set import combine, flatten, joint_combine


def get_children(get_node, root_id):
    root = get_node(root_id)
    if root["data"]["type"] == "span":
        return [root_id]
    else:
        return [root_id] + flatten(
            [
                get_children(get_node, child["id"])
                for child in root["children"]
                if child["type"] == "node"
            ]
        )


def get_mutable(get_node, root_id):
    root = get_node(root_id)
    if root.get("value") is not None:
        return []
    elif root["data"]["type"] == "span":
        return [[root_id]]
    elif root.get("collapsed"):
        return [get_children(get_node, root_id)]
    else:
        return [[root_id]] + flatten(
            [
                get_mutable(get_node, child["id"])
                for child in root["children"]
                if child["type"] == "node"
            ]
        )


def perturb_sent(span_dict, get_node, root_id):
    print("Invoked perturb_sent")
    mutable_nodes = get_mutable(get_node, root_id)
    print("Mutable nodes: ", mutable_nodes)
    new_sents = []
    span_subsets = []
    for subset in combine(mutable_nodes):
        subset = flatten(subset)
        sent_text = recover_text_from_node(span_dict, get_node, root_id, subset)
        if sent_text not in new_sents:
            new_sents.append(sent_text)
            span_subsets.append(subset)
    # print("New sents: ", new_sents)
    # print("Span subsets: ", span_subsets)
    # for text, subset in zip(new_sents, span_subsets):
    # fmt: off
        # print(f"Text: {text}, Subset: {subset}")
    return span_subsets


def perturb_passage(spec, sampling=None, max_queries=None):
    nodes = spec["nodes"]
    span_dict = {span["id"]: span for span in spec["spans"]}
    sent_combs = []

    def get_node(x):
        return nodes[x]

    roots = [i for i, node in enumerate(nodes) if node.get("parent") == None]
    for root in roots:
        sent_combs.append(perturb_sent(span_dict, get_node, root))

    if sampling is None:
        span_subsets = joint_combine(sent_combs)
    else:
        assert max_queries is not None
        n_comb_list = [len(comb) for comb in sent_combs]
        n_combs = 1
        for n in n_comb_list:
            n_combs *= n
        if n_combs < max_queries:
            random_ids = range(n_combs)
            warnings.warn(
                "The max query number is larger than the number of combinations."
            )
        else:
            random_ids = random.sample(range(n_combs), max_queries)
        span_subsets = []
        for iid in random_ids:
            subset = []
            for comb in sent_combs:
                subset += comb[round(iid % len(comb))]
                iid = int(iid / len(comb))
            span_subsets.append(subset)

    return span_subsets
