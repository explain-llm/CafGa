import language_tool_python
from colab.parser.parser import parse_sent
from colab.deprecated.sampler import perturb_sent
from colab.deprecated.recover import recover_sent
import numpy as np
import eval_utils
import argparse
import time

args = argparse.ArgumentParser()
args.add_argument("-d", "--dataset", default="med")
args = args.parse_args()


@eval_utils.timeout(20)
def parse_and_sample(sent):
    sent_parsed = parse_sent(sent)
    # sadly this can't be a generator otherwise the timeout doesn't work
    sents = []
    for sent in perturb_sent(sent_parsed):
        if sent:
            sents.append(recover_sent(sent_parsed["rule"], sent))
    return sents


grammar = language_tool_python.LanguageTool('en-US')
dataset = eval_utils.get_dataset(args.dataset)


def number_of_errors(sent):
    return len(
        [
            c
            for c in grammar.check(sent)
            if c.ruleId not in {"COMMA_COMPOUND_SENTENCE", "MORFOLOGIK_RULE_EN_US"}
        ]
    )

sample_time = []
sent_len = []
results = []
for sent in dataset:
    orig_flaws = number_of_errors(sent)
    print("~~~", orig_flaws, sent)
    sent_len.append(len(sent.split()))
    try:
        time_start = time.time()
        sent_generations = list(parse_and_sample(sent))
        sample_time.append(time.time()-time_start)
        sent_generations = [
            (s, number_of_errors(s)) for s in sent_generations
        ]
    # except eval_utils.TimeoutException:
    except:
        print("TIMEOUT")
        results.append(None)
    sent_offending = [(s, f) for s, f in sent_generations if f > orig_flaws]
    # add the proportion of offending sentences
    results.append((len(sent_offending), len(sent_generations)))
    for s, f in sent_offending:
        print("OFFEND", f, s)

print("Total sentences:    ", len(results))
print("Total sub-sentences:", sum([x[1] for x in results if x is not None]))
print(
    f"Offending rate:      ",
    f"{np.average([x[0]/x[1] for x in results if x is not None]):.1%}",
    f"({sum([x[0] for x in results if x is not None]):.0f})",
)
print(
    f"Timeout interrupt:   ",
    f"{np.average([x is None for x in results]):.1%}",
    f"({sum([x is None for x in results]):.0f})",
)
print(
    f"Average parse & sample time: ",
    f"{np.average(sample_time):.1f}s",
)
print(
    f"Average sentence length:     ",
    f"{np.average(sent_len):.1f}",
)