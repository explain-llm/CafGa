import language_tool_python
from colab.parser.parser import parse_sent
from colab.deprecated.sampler import perturb_sent
from colab.deprecated.recover import recover_sent

TEXTS = [
    ("A 23-year-old pregnant woman at 22 weeks gestation presents with burning upon urination.", "MedQA"),
    ("A mother brings her 3-week-old infant to the pediatrician’s office because she is concerned about his feeding habits.", "MedQA"),
    ("Requires States to allocate funds from Federal and State shares of program costs to LEAs according to specified formulae.", "BillSum"),
    ("Requires plaintiffs who obtain a preliminary injunction or administrative stay in Indian energy related actions to post bond.", "BillSum"),
    ("You trade in a car and they sell it at a profit.", "FinQA"),
    ("You’re losing money in more than one way on that investment.", "FinQA"),
    ("Here at MarketBeat HQ, we’ll be offering color commentary before and after the data crosses the wires.", "MultiNews"),
    ("He didn’t take responsibility for his comment and he fails horribly at humor.", "MultiNews"),
    ("The most promising agents in clinical development are reviewed.", "TinyTextbooks"),
    ("For all kinds of business problems, we are there to help you to resolve business problems by astrology.", "TinyTextbooks"),
]

grammar = language_tool_python.LanguageTool('en-US')

def parse_and_sample(sent):
    sent_parsed = parse_sent(sent)
    # sadly this can't be a generator otherwise the timeout doesn't work
    sents = []
    for sent in perturb_sent(sent_parsed):
        if sent:
            sents.append(recover_sent(sent_parsed["rule"], sent))
    return sents

def number_of_errors(sent):
    return len(
        [
            c
            for c in grammar.check(sent)
            if c.ruleId not in {"COMMA_COMPOUND_SENTENCE", "MORFOLOGIK_RULE_EN_US"}
        ]
    )


for text, domain in TEXTS:
    print("\n"*2)
    print(r"\textexamplenofig{")
    print(r"\textbf{", text, r"} ", f"({domain})", r" \\", sep="")
    perturbations = list(parse_and_sample(text))
    errors_orig = number_of_errors(text)
    for perturbation in perturbations:
        dagger = "" if number_of_errors(perturbation) <= errors_orig else r"$\dagger$"
        # print(errors_orig, number_of_errors(perturbation), perturbation)
        print(perturbation, dagger, r"\\")
    print(r"}")