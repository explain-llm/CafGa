import spacy

# python3 -m spacy download en_core_web_trf
nlp = spacy.load("en_core_web_trf")


def compute_span_range(conjset):
    indicies_min = min([token.i - token.n_lefts for token in conjset])
    indicies_max = max([token.i + token.n_rights for token in conjset])
    # assuming that there is no non-projectivity
    return (indicies_min, indicies_max)

def can_tree_be_omitted(token):
    return token.dep_ in {"acl", "advcl", "prep", "relcl", "amod"}

def can_word_be_omitted(token, tokens):
    # if it has dependency, then it can't be omitted on word-level
    if len(list(token.subtree)) > 1:
        return False
    # token - word in question
    # tokens - remainin following tokens

    if token.dep_.split(":")[0] in {"amod", "advmod", "nomd"}:
        return True
    if token.dep_.split(":")[0] == "nummod":
        TIME_WORDS = {
            "second", "seconds", "minute", "minutes", "hour", "hours",
            "day", "days", "week", "weeks", "month", "months", "year", "years"
        }
        if len(tokens) > 0 and tokens[0].text in TIME_WORDS:
            # workaround for 21 year old, 21 years old
            return False
        elif len(tokens) > 1 and tokens[0].text == "-" and tokens[1].text in TIME_WORDS:
            # workaround for 21-years-old
            return False
        else:
            return True
    return False

def span_parse(tokens, ignore_relative_clauses=False):
    comp_rule = []
    tokens = list(tokens)

    # yank out relative clauses before main processing

    if not ignore_relative_clauses:
        relative_subtrees_raw = [
            list(token.subtree) for token in tokens if can_tree_be_omitted(token)
        ]

        # in case there are surrounding commas, let's take them out and put them in the subtree
        relative_subtrees = []
        for subtree in relative_subtrees_raw:
            token_left_i = subtree[0].i - 1
            token_left = [
                token
                for token in tokens
                if token.i == token_left_i and token.text == ","
            ]
            if token_left:
                subtree.insert(0, token_left[0])
            token_right_i = subtree[-1].i + 1
            token_right = [
                token
                for token in tokens
                if token.i == token_right_i and token.text == ","
            ]
            if token_right:
                subtree.append(token_right[0])

            relative_subtrees.append(subtree)

        banlist_i = {token.i for subtree in relative_subtrees for token in subtree}
        # turn into parse
        relative_subtrees = [
            span_parse(subtree, ignore_relative_clauses=True)
            for subtree in relative_subtrees_raw
        ]
    else:
        relative_subtrees = []
        banlist_i = set()

    while tokens:
        token = tokens.pop(0)

        if not ignore_relative_clauses and can_tree_be_omitted(token):
            comp_rule.append(
                {
                    "type": "comp-spans",
                    "comp-rule": "CONCAT",
                    "necessary": False,
                    # needed for conjsets processing
                    "id": -1,
                    # there's exactly as many relative clauses as NONNECESSARY_DEP tokens
                    "spans": relative_subtrees.pop(0),
                }
            )
        else:
            # these tokens are already processed
            if token.i in banlist_i:
                continue
            comp_rule.append(
                {
                    "type": "span",
                    "id": token.i,
                    "necessary": not can_word_be_omitted(token, tokens),
                }
            )
    return comp_rule


def sent_token_yield(node, tokens):
    return [
        token
        for token in tokens
        if (token == node)
        or (token in node.subtree and token.dep_ not in {"cc", "conj"})
    ]


def span_2_comp(tokens):
    comp_rule = span_parse(tokens)

    conjsets = set()
    for token in tokens:
        if token.conjuncts:
            conjset = frozenset([token] + list(token.conjuncts))
            if conjset not in conjsets:
                conjsets.add(conjset)
    conjsets = {compute_span_range(conjset): conjset for conjset in conjsets}

    def conjsets_in_interval(i):
        return [v for k, v in conjsets.items() if i >= k[0] and i <= k[1]]

    comp_rule = [(rule, conjsets_in_interval(rule["id"])) for rule in comp_rule]
    seen_conjsets = set()
    comp_rule_new = []
    for rule, conjset in comp_rule:
        if conjset:
            conjset_set = conjset[0]
            if conjset_set in seen_conjsets:
                # skip
                continue
            else:
                seen_conjsets.add(conjset_set)
                spans = [
                    {
                        "type": "comp-spans",
                        "comp-rule": "CONCAT",
                        "spans": span_parse(sent_token_yield(conj_root, tokens)),
                    }
                    for conj_root in conjset_set
                ]
                # sort by first token in the subtree
                spans.sort(key=lambda x: x["spans"][0]["id"])
                # new conjset parse
                comp_rule_new.append(
                    {
                        "type": "comp-spans",
                        "comp-rule": "CONJ",
                        "comp-param": "AND",
                        "necessary": True,
                        "spans": spans,
                    }
                )
        else:
            comp_rule_new.append(rule)

    return comp_rule_new


def parse_sent(sent):
    tokens = nlp(sent)

    comp_rule = span_2_comp(tokens)
    spans = [
        {
            "id": token.i,
            "text": token.text,
        }
        for token in tokens
    ]

    rule_spec = {"type": "comp-spans", "comp-rule": "CONCAT", "spans": comp_rule}

    to_merge = find_mergeable_spans(rule_spec)
    spans_new = []
    for token in spans:
        if token["id"] in to_merge:
            # merge with the last one, if possible
            spans_new[-1]["text"] += " " + token["text"]
        else:
            spans_new.append(token)

    rule_spec = filter_rule_spec(rule_spec, to_merge)

    return {"spans": spans_new, "rule": rule_spec}


def find_mergeable_spans(rule_spec):
    to_merge = set()

    if type(rule_spec) == list:
        # to make sure that it can be merged with the direct predecesor
        just_added = False
        for obj_i, obj in enumerate(rule_spec):
            if obj["type"] == "comp-spans":
                just_added = False
                to_merge |= find_mergeable_spans(obj["spans"])
            elif not just_added:
                just_added = True
                continue
            elif (
                obj["type"] == "span"
                and just_added
                and obj["necessary"]
                and rule_spec[obj_i - 1]["type"] == "span"
                and rule_spec[obj_i - 1]["necessary"]
            ):
                to_merge.add(obj["id"])
    elif rule_spec["type"] == "comp-spans":
        return find_mergeable_spans(rule_spec["spans"])

    return to_merge


def filter_rule_spec(rule_spec, to_merge):
    if type(rule_spec) == list:
        return [
            x if x["type"] == "span" else filter_rule_spec(x, to_merge)
            for x in rule_spec
            if x["type"] != "span" or x["id"] not in to_merge
        ]
    else:
        return {**rule_spec, "spans": filter_rule_spec(rule_spec["spans"], to_merge)}
