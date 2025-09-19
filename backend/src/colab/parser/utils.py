def simplify_parse(spans, rule_spec):
    # run flattening twice
    rule_spec = flatten_rule_spec(rule_spec)
    to_merge = find_mergeable_spans(rule_spec)
    spans_new = []
    for token in spans:
        if token["id"] in to_merge:
            # merge with the last one, if possible
            spans_new[-1]["text"] = space_aware_merge([spans_new[-1]["text"], token["text"]])
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

def flatten_rule_spec(rule_spec):
    if type(rule_spec) == list:
        return [flatten_rule_spec(x) for x in rule_spec]
    else:
        if "spans" in rule_spec:
            if len(rule_spec["spans"]) == 1:
                # we can omit it if either the parent or the child can be omitted
                # they are kind of the same thing
                rule_spec["spans"][0]["necessary"] = rule_spec["spans"][0]["necessary"] and rule_spec["necessary"]
                return rule_spec["spans"][0]
            else:
                rule_spec["spans"] = flatten_rule_spec(rule_spec["spans"])
        
        return rule_spec

def filter_rule_spec(rule_spec, to_merge):
    if type(rule_spec) == list:
        return [
            x if x["type"] == "span" else filter_rule_spec(x, to_merge)
            for x in rule_spec
            if x["type"] != "span" or x["id"] not in to_merge
        ]
    else:
        return {**rule_spec, "spans": filter_rule_spec(rule_spec["spans"], to_merge)}

def space_aware_merge(spans):
    out = ""
    for span in spans:
        if span is None:
            continue
        if out and out[-1].isalnum() and span[0].isalnum():
            # add with space
            # e.g. "daily" "pills"
            out += " " + span
        else:
            # add without space
            # e.g. "-" "5"
            out += span
    return out