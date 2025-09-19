from src.colab.utils.migrant import (
    simplify_tree,
    spec2new,
    update_span_idx_from_sents,
)
from .utils import simplify_parse
import spacy
import nltk.tokenize

# python3 -m spacy download en_core_web_trf
nlp = spacy.load("en_core_web_trf")


def can_tree_be_omitted(token):
    # specific handling for 21-years-old
    if token.dep_ in {"nummod"}:
        parent = list(token.ancestors)
        if not parent:
            return True
        parent = parent[0].text.removesuffix("s")
        return parent not in {
            "second",
            "minute",
            "hour",
            "day",
            "week",
            "month",
            "year",
        }

    return token.dep_ in {
        "amod",
        "advmod",
        "nomd",
        "acl",
        "advcl",
        "prep",
        "relcl",
    }


CONJ_TOKENS = None


def parse_token(token, parse_as_token):
    global CONJ_TOKENS

    # just a single token without further dependencies
    if parse_as_token:
        return {
            "type": "span",
            "necessary": True,
            "id": token.i,
            "text": token.text_with_ws,
        }

    siblings = list(token.conjuncts)
    if siblings and token.i not in CONJ_TOKENS:
        # prevent direct children and transitive conjs to instantiate conjs
        # the children in this ring are only whatever is in the conjuncts ring
        children = list(token.conjuncts) + [token]
        children.sort(key=lambda x: x.i)

        CONJ_TOKENS |= {child.i for child in children}

        children_left = [child for child in children if child.i < token.i]
        children_right = [child for child in children if child.i > token.i]

        # TODO: also process OR

        spans = (
            [parse_token(child, parse_as_token=False) for child in children_left]
            + [parse_token(token, parse_as_token=False)]
            + [parse_token(child, parse_as_token=False) for child in children_right]
        )

        children_txt = {child.text for child in token.children}
        return {
            "type": "comp-spans",
            "comp-rule": "CONJ",
            "comp-param": "OR" if "or" in children_txt else "AND",
            "necessary": not can_tree_be_omitted(token),
            "spans": [x for x in spans if x],
        }

    # don't follow-up with CONJ tokens because they're already processed
    children = [child for child in token.children if child.i not in CONJ_TOKENS]
    # if token is in a CONJ then skip children which are "and" or ","
    if token.i in CONJ_TOKENS:
        children = [child for child in children if child.dep_ not in {"cc", "punct"}]

    children_left = [child for child in children if child.i < token.i]
    children_right = [child for child in children if child.i > token.i]

    spans = (
        [parse_token(child, parse_as_token=False) for child in children_left]
        + [parse_token(token, parse_as_token=True)]
        + [parse_token(child, parse_as_token=False) for child in children_right]
    )
    return {
        "type": "comp-spans",
        "comp-rule": "CONCAT",
        "spans": [x for x in spans if x],
        # if the token is part of CONJ then it can be dropped
        "necessary": (False if token.i in CONJ_TOKENS else not can_tree_be_omitted(token)),
    }


def parse_sent(sent):
    global CONJ_TOKENS
    tokens = nlp(sent)
    CONJ_TOKENS = set()
    token_root = [token for token in tokens if token.dep_ == "ROOT"][0]

    rule_spec = parse_token(token_root, parse_as_token=False)
    spans = [
        {
            "id": token.i,
            "text": token.text_with_ws,
        }
        for token in tokens
    ]

    return simplify_parse(spans, rule_spec)


def parse_passage(content):
    sents = nltk.tokenize.sent_tokenize(content)

    parsed_sents = [parse_sent(sent) for sent in sents]
    old_spec = update_span_idx_from_sents(parsed_sents)
    old_spec = [
        {"spans": sent_spec["spans"], "rule": simplify_tree(sent_spec["rule"])}
        for sent_spec in old_spec
    ]
    # old_spec = [parse_sent(sent) for sent in sents]
    spec = spec2new(old_spec)
    return spec
