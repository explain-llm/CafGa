from colab.parser.parser import parse_sent
from colab.deprecated.sampler import perturb_sent
from colab.deprecated.recover import recover_sent

def parse_and_sample(sent):
    print()
    print("~~~", sent, "~~~")
    sent_parsed = parse_sent(sent)
    for sent in perturb_sent(sent_parsed):
        if sent:
            print(recover_sent(sent_parsed["rule"], sent))

def _analyze(x):
    from colab.parser.parser import nlp
    tokens = nlp(x)
    for token in tokens:
        token_children = " ".join([str(x) for x in token.children])
        token_conjs = " ".join([str(x) for x in token.conjuncts])
        print(token.i, f"{str(token):>15}", f"{token.dep_:>10}", f"{token_children:<30}", f"{token_conjs:<30}",)

parse_and_sample("Very tall Anne definitely loves 5 cities.")
parse_and_sample("Anne loves cities and blue jeans.")
parse_and_sample("Anne loves 5 cities and blue jeans more than black tea and sunsets.")
parse_and_sample("William Henry Gates III (born October 28, 1955) is an American businessman.")
parse_and_sample("William Henry Gates III, born October 28, 1955, is an American businessman.")
parse_and_sample("Who did the grey T-shirt belong to?")
parse_and_sample("William Henry Gates III (born October 28, 1955) is an American businessman, investor, philanthropist, and writer.")

# testing conjuctives
parse_and_sample("running on sand and swiming in water")
parse_and_sample("he likes running on wet sand and swiming in cold water")
parse_and_sample("he likes apples and bananas")
parse_and_sample("He needed to go because she arrived.")

# testing prepositional phrases
parse_and_sample("he likes apples from trees")
parse_and_sample("she likes to sit on the sofa")
parse_and_sample("they enjoy the time on the sunny beach")
parse_and_sample("I have nobody to give it to")
parse_and_sample("he relies on himself")

# relative clauses
parse_and_sample("I have a pet iguana whose name is Fluffy.")
parse_and_sample("I have an apple which is very tasty.")

# story examples
parse_and_sample("A 21-year-old sexually active male complains of fever, pain during urination and inflammation and pain in the right knee.")
parse_and_sample("A culture of the joint fluid shows a bacteria that does not ferment maltose and has no polysaccharide capsule.")
parse_and_sample("The physician orders antibiotic therapy for the patient.")
parse_and_sample("The mechanism of action of the medication given blocks cell wall synthesis.")
parse_and_sample("A 23-year-old pregnant woman presents with burning upon urination.")
parse_and_sample("She states it started 1 day ago and has been worsen.")
parse_and_sample("Physical exam is notable for an absence of costovertebral angle tenderness and a gravid uterus.")

# incomplete compound sentence
parse_and_sample("She otherwise feels well and is followed by a doctor for her pregnancy.")