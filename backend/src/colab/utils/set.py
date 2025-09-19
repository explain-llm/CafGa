### Utility functions
from itertools import combinations

def and_join(span_text):
    if all([span is None for span in span_text]):
        return None
    if len(span_text) == 1:
        return span_text[0]
    elif len(span_text) > 1:
        return ", ".join(span_text[:-1]) + "and " + span_text[-1]
    
def or_join(span_text):
    if all([span is None for span in span_text]):
        return None
    if len(span_text) == 1:
        return span_text[0]
    elif len(span_text) > 1:
        return ", ".join(span_text[:-1]) + " or " + span_text[-1]
    
def but_join(span_text):
    if all([span is None for span in span_text]):
        return None
    if len(span_text) != 2:
        return None
    else:
        return ", ".join(span_text[:-1]) + " but " + span_text[-1]
    
def flatten(iterable):
    flatted = []
    for item in iterable:
        flatted += item
    return flatted


def combine(iterable):
    combs = []
    for n in range(len(iterable)+1):
        combs += combinations(iterable, n)
    return combs


def joint_combine(iterable):
    combs = [[ele] for ele in iterable[0]]

    for s in iterable[1:]:
        combs = [[*comb, ele]
                 for comb in combs for ele in s]
    return combs