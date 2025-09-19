import { Operator } from "../datatypes/settings";
import { getRandomInt } from "./util";
export interface TaskDescriptor {
    title: string;
    description: string;
}
export interface PredefinedTask {
    title: string;
    description: string;
    input: string;
    template: string;
    target: string;
    operator: Operator;
    taskId: string;
}

export const predefinedStudyTasks: TaskDescriptor[] = [
    {
        title: "Level 0: Example Task",
        description: "This is an example task you can work through to get a feel for the platform.",
    },
    {
        title: "Level 1: Local Question Answering",
        description: "Given a question and context, the goal is to answer the question based on the context.",
    },
    {
        title: "Level 2: Food Review",
        description: "Given a review of a food item, the goal is to determine whether the review has positive or negative sentiment.", 
    },
    {
        title: "Level 3: Faulty Prompt Engineering",
        description: "Given a set of examples, the model is asked to perform a specific task on a new example. But why is the model giving weird answers?!",
    },
    {
        title: "Level 4: Complex Question Answering",
        description: "The model is given a question and a set of possibly misleading facts. The goal is to answer the question based on the facts.",
    },
    {
        title: "Level 5: Long Form Text Comprehension",
        description: "Given a long text spanning multiple paragraphs, the goal is to answer what a specific phrase refers to.",
    },
]
export const predefinedTasks: TaskDescriptor[] = [
    {
        title: "Example Task",
        description: "This is an example task you can work through to get a feel for the platform.",
    },
    {
        title: "Local Question Answering",
        description: "Given a question and context, the goal is to answer the question based on the context.",
    },
    {
        title: "Houses Puzzle",
        description: "Given a description of different inhabitants in a row of houses. The goal is to find the house a specific inhabitant lives in.",
    },
    {
        title: "Restaurant Review",
        description: "Given a review of a restaurant, the goal is to determine whether the review has positive or negative sentiment.",
    },
    {
        title: "Faulty Prompt Engineering",
        description: "Given a set of examples, the model is asked to perform a specific task on a new example. But why is the model giving weird answers?!",
    },
    {
        title: "Complex Question Answering",
        description: "The model is given a question and a set of possibly misleading facts. The goal is to answer the question based on the facts.",
    },
    {
        title: "Long Form Text Comprehension",
        description: "Given a long text spanning multiple paragraphs, the goal is to answer what a specific phrase refers to.",
    },
    
    // {
    //     title: "First Order Logic Puzzle",
    //     description : "Given a set of first order logic premises and a possible conclusion, the goal is to determine if the conclusion follows from the premises.",
    // },

]

const exampleTasks : PredefinedTask[] = [
    {
        title: "Example Task",
        description: "This is an example task you can work through to get a feel for the platform.",
        input: "I'm excited to use CafGa, but I'm still unsure about its usage.",
        template: "For the text snippet below answer whether it has positive or negative sentiment. Your answer should be a single letter: p (for positive) or n (for negative). In case you cannot answer leave the response empty.\nText Snippet:\n{input}",
        target: "p",
        operator: Operator.EQUAL,
        taskId: "example",

    }
]

const SQUAD: PredefinedTask[] = [
    {
        title: "Local Question Answering",
        description: "The model is given a context and asked to answer a question that can be answered based on the context alone.",
        input: "In 1873, Tesla returned to his birthtown, Smiljan. Shortly after he arrived, Tesla contracted cholera; he was bedridden for nine months and was near death multiple times. Tesla's father, in a moment of despair, promised to send him to the best engineering school if he recovered from the illness.",
        template: "Given the following context:\n{input}\nAnswer the following question in at most five words. If you cannot answer give an empty response.\nQuestion:\nWhat did Tesla's father promise him while he was bedridden?",
        target: "best engineering school",
        operator: Operator.CONTAIN,
        taskId: "SQUAD_0"
    },
    {
        title: "Local Question Answering",
        description: "The model is given a context and asked to answer a question that can be answered based on the context alone.",
        input: "The Normans (Norman: Nourmands; French: Normands; Latin: Normanni) were the people who in the 10th and 11th centuries gave their name to Normandy, a region in France. They were descended from Norse (\"Norman\" comes from \"Norseman\") raiders and pirates from Denmark, Iceland and Norway who, under their leader Rollo, agreed to swear fealty to King Charles III of West Francia. Through generations of assimilation and mixing with the native Frankish and Roman-Gaulish populations, their descendants would gradually merge with the Carolingian-based cultures of West Francia. The distinct cultural and ethnic identity of the Normans emerged initially in the first half of the 10th century, and it continued to evolve over the succeeding centuries.",
        template: "Given the following context:\n{input}\nAnswer the following question in at most five words. If you cannot answer give an empty response.\nQuestion:\nIn what century did the Normans first gain their separate identity?",
        target: "10th century",
        operator: Operator.CONTAIN,
        taskId: "SQUAD_1",
    },
    {
        title: "Local Question Answering",
        description: "The model is given a context and asked to answer a question that can be answered based on the context alone.",
        input: "Several barriers protect organisms from infection, including mechanical, chemical, and biological barriers. The waxy cuticle of many leaves, the exoskeleton of insects, the shells and membranes of externally deposited eggs, and skin are examples of mechanical barriers that are the first line of defense against infection. However, as organisms cannot be completely sealed from their environments, other systems act to protect body openings such as the lungs, intestines, and the genitourinary tract. In the lungs, coughing and sneezing mechanically eject pathogens and other irritants from the respiratory tract. The flushing action of tears and urine also mechanically expels pathogens, while mucus secreted by the respiratory and gastrointestinal tract serves to trap and entangle microorganisms.",
        template: "Given the following context:\n{input}\nAnswer the following question as succinctly as possible. The answer should contain no more than five words. If you cannot answer then give an empty response.\nQuestion:\nWhat is an example of a mechanical barrier on leaves?",
        target: "waxy cuticle",
        operator: Operator.CONTAIN,
        taskId: "SQUAD_2",
    },
    {
        title: "Local Question Answering",
        description: "The model is given a context and asked to answer a question that can be answered based on the context alone.",
        input: "Steam engines are external combustion engines, where the working fluid is separate from the combustion products. Non-combustion heat sources such as solar power, nuclear power or geothermal energy may be used. The ideal thermodynamic cycle used to analyze this process is called the Rankine cycle. In the cycle, water is heated and transforms into steam within a boiler operating at a high pressure. When expanded through pistons or turbines, mechanical work is done. The reduced-pressure steam is then condensed and pumped back into the boiler.",
        template: "Given the following context:\n{input}\nAnswer the following question as succinctly as possible. The answer should contain no more than five words. If you cannot answer then give an empty response.\nQuestion:\nAt what pressure is water heated in the Rankine cycle?",
        target: "high pressure",
        operator: Operator.CONTAIN,
        taskId: "SQUAD_3",
    },
    {
        title: "Local Question Answering",
        description: "The model is given a context and asked to answer a question that can be answered based on the context alone.",
        input: "A teacher's professional duties may extend beyond formal teaching. Outside of the classroom teachers may accompany students on field trips, supervise study halls, help with the organization of school functions, and serve as supervisors for extracurricular activities. In some education systems, teachers may have responsibility for student discipline.",
        template: "Given the following context:\n{input}\nAnswer the following question as succinctly as possible. The answer should contain no more than five words. If you cannot answer then give an empty response.\nQuestion:\nWhat could a teacher help in organizing?",
        target: "school functions",
        operator: Operator.CONTAIN,
        taskId: "SQUAD_4",
    }
]
const GridPuzzle: PredefinedTask[] = [
    {
        title: "Houses Puzzle",
        description: "The puzzle describes a row of houses with different inhabitants. The goal is to find the house a specific inhabitant lives in.",
        input: "- Each person has a favorite drink: one likes milk, one is a tea drinker, and one only drinks water\n- Each person plays a different musical instrument: one is a violinist, one is a cellist, and one is a guitarist\n- The person who only drinks water lives somewhere to the right of the cellist.\n- There is one house between where the violinist lives and where the guitarist lives.\n- The tea drinker lives in the first house.\n- The violinist does not live in the third house.",
        template: "There are 3 houses in a row, numbered 1 on the left to 3 on the right. There is one person living in each house. The people in these houses have different characteristics:\n{input}\nAnswer the following question:\nWhat is the number of the house where the guitarist lives?",
        target: "The guitarist lives in house 3.",
        operator: Operator.ENTAIL,
        taskId: "housePuzzle_0",
    },
    
]
const restaurantReview: PredefinedTask[] = [
    {
        title: "Food Review",
        description: "Given a review of a food item, the goal is to determine whether the review has positive or negative sentiment.",
        input: "The bun makes the Sonoran Dog. It's like a snuggie for the pup. At first, it seems ridiculous and almost like it's going to be too much, exactly like everyone's favorite blanket with sleeves. Too much softness, too much smush, too indulgent. Wrong. It's warm, soft, chewy, fragrant, and it succeeds where other famed Sonoran Dogs fail. The hot dog itself is flavorful, but I would prefer that it or the bacon have a little more bite or snap to better hold their own against the dominant mustard and onions.",
        template: "For the text snippet below answer whether it has positive or negative sentiment. Your answer should be a single letter: p (for positive) or n (for negative). In case you cannot answer leave the response empty.\nText Snippet:\n{input}",
        target: "p",
        operator: Operator.EQUAL,
        taskId: "restaurantReview_0",
    },
    {
        title: "Food Review",
        description: "Given a review of a food item, the goal is to determine whether the review has positive or negative sentiment.",
        input: "If you decide to eat here, just be aware it is going to take about 2 hours from beginning to end. We have tried it multiple times, because I want to like it! I have been to it's other locations in NJ and never had a bad experience. The food is good, but it takes a very long time to come out. The waitstaff is very young, but usually pleasant. We have just had too many experiences where we spent way too long waiting. We usually opt for another diner or restaurant on the weekends, in order to be done quicker.",
        template: "For the text snippet below answer whether it has positive or negative sentiment. Your answer should be a single letter: p (for positive) or n (for negative). In case you cannot answer leave the response empty.\nText Snippet:\n{input}",
        target: "n",
        operator: Operator.EQUAL,
        taskId: "restaurantReview_1",
    },
    {
        title: "Food Review",
        description: "Given a review of a food item, the goal is to determine whether the review has positive or negative sentiment.",
        input: "Cheese curds were very good and very filling. Really like that sandwiches come w salad, esp after eating too many curds! Had the onion, gruyere, tomato sandwich. It had what some might say is too much cheese, which I liked. Needed something else, pepper jelly maybe. I would have liked to have more options on the menu.",
        template: "For the text snippet below answer whether it has positive or negative sentiment. Your answer should be a single letter: p (for positive) or n (for negative). In case you cannot answer leave the response empty.\nText Snippet:\n{input}",
        target: "p",
        operator: Operator.EQUAL,
        taskId: "restaurantReview_2",
    },
    {
        title: "Food Review",
        description: "Given a review of a food item, the goal is to determine whether the review has positive or negative sentiment.",
        input: "I am a long term frequent customer of this establishment. I just went in to order take out (3 apps) and was told they're too busy to do it. Really? The place is maybe half full at best. I'm a frequent customer AND great tipper. Glad that Kanella just opened. NEVER going back to dmitris!",
        template: "For the text snippet below answer whether it has positive or negative sentiment. Your answer should be a single letter: p (for positive) or n (for negative). In case you cannot answer leave the response empty.\nText Snippet:\n{input}",
        target: "n",
        operator: Operator.EQUAL,
        taskId: "restaurantReview_3",
    },
    {
        title: "Food Review",
        description: "Given a review of a food item, the goal is to determine whether the review has positive or negative sentiment.",
        input: "The food was great, though it took a while to come out. It's definitely not a place you can go to on a regular basis (40-50$ avg for main course), but it's worth it for special occasions. I wish they could be more accommodating. Like, I wanted to change my side from a gratin to hash browns, but no not possible... The others didn't seem to mind, so perhaps it's just me.",
        template: "For the text snippet below answer whether it has positive or negative sentiment. Your answer should be a single letter: p (for positive) or n (for negative). In case you cannot answer leave the response empty.\nText Snippet:\n{input}",
        target: "p",
        operator: Operator.EQUAL,
        taskId: "restaurantReview_4",
    },
]
const PromptEngineering: PredefinedTask[] = [
    {
        title: "Faulty Prompt Engineering",
        description: "Given a set of examples, the model is asked to perform a specific task on a new example. But the model is giving weird answers!",
        input: "I would like to collect the items named in a sentence into a list. Here are some examples that I would like for you to exactly follow: \n\nI brought an apple, a sandwich and a bottle orange juice as my lunch.\n->\n[ale, sandwich, oj]\n\nJules brought two bananas, an O-nigiri and a bottle of water for lunch.\n->\n[banana, onigiri]\n\nFlorence brought an orange, a burrito and a soft drink for lunch.\n->\n[orange, bito, softdrink]",
        template: "{input}\n\nItem I need your help with:\n\nJoanne brought an apple, a burrito and an orange juice for lunch.\n->",
        target: "{model}",
        operator: Operator.CONTAIN,
        taskId: "promptEngineering_0",
    },
    {
        title: "Faulty Prompt Engineering",
        description: "Given a set of examples, the model is asked to perform a specific task on a new example. But the model is giving weird answers!",
        input: "I have some text snippets that contain slang for currency and I would like you to give me the total cost in dollars of the items mentioned in the snippet. Here are some examples I would like you to follow exactly:\n\nI put a fifty on seven and just for fun I bet five bucks on five.\n->\n55.0$\n\nThis pair of shoes cost me one Benjamin each per shoe.\n->\n2.0\n\nBack in the day I could get a burger for a half, fries and a donut for a quarter each and a drink for a single dime.\n->\n1.1$",
        template: "{input}\n\nThe item I need your help with is below. Answer with a single number.\nThese three watches each cost me one and a half Benjamins.\n->\n",
        target: "{model}",
        operator: Operator.CONTAIN,
        taskId: "promptEngineering_1",
    },
    {
        title: "Faulty Prompt Engineering",
        description: "Given a set of examples, the model is asked to perform a specific task on a new example. But the model is giving weird answers!",
        input: "I have some math and logic problems with solutions and would like you to solve another one for me. My friend gave me these solutions from my teacher and said she wants me to follow the way she solved them exactly. She didn't give me a solution for the last problem though so I need your help to check whether I got it right. Below are some examples. Only fill in the solution, do not give me a long winded explanation. I want to go play with my friends soon so I don't have the time to read another one of your essays...\n\nProblem: You are five stops away from the station you need to get off at. The train stops two more times. How many stops away are you now?\nSolution: 5 - 2 = 3\n\nProblem: You are currently four stops away from central station. Previously you were two stops away from central station. The train moves one station. How many stops away are you now?\nSolution: 4 - 1 = 3\n\nProblem: You just left school and got on the train back home. You are currently three stops away from school. The train moves two more stations. How far away are you from the station you got on at?\nSolution: 3 + 2 = 5\n\nProblem: You are currently five stops away from central park station. Previously you were two stops away from central park station. The train moves one station. How many stops away are you now?\nSolution: 5 - 2 = 3", 
        template: "{input}\n\nThe item I need your help with is below.\n\nProblem: You are currently three stops away from the station \"Zoo\". Previously you were one stop away from \"Zoo\" station. The train moves one station. How many stops away are you now?\nSolution: ",
        target: "{model}",
        operator: Operator.CONTAIN,
        taskId: "promptEngineering_2",
    },
    
]
const ComplexQA: PredefinedTask[] = [
    {
        title: "Complex Question Answering",
        description: "The model is given a context and asked to answer a question that requires reasoning over multiple sentences.",
        input: "Evan Almighty is a 2007 American fantasy comedy film and the stand-alone sequel/spin-off to \"Bruce Almighty\" (2003). The film was directed by Tom Shadyac, written by Steve Oedekerk, based on the characters created by Steve Koren and Mark O'Keefe from the original film, and starring Steve Carell, Morgan Freeman, Lauren Graham and John Goodman.\n\nFred Claus is a 2007 American fantasy comedy family film directed by David Dobkin, written by Dan Fogelman and Jessie Nelson, and starring Vince Vaughn and Paul Giamatti The film was released on November 9, 2007 in the US and later released in the UK on November 30, 2007 by Warner Bros. Pictures. It is loosely based on the poem \"A legend of Santa and his brother Fred\" written by Donald Henkel.\n\nSteven John Carell (born August 16, 1962) is an American actor, comedian, director, producer, and writer. Carell is best known for playing Michael Scott on the American version of \"The Office\"(2005-2011), on which he also worked as an occasional writer, producer, and director.\n\nWho was the director of the 2007 American fantasy comedy film in which the actor best known for playing Michael Scott on the the American version of \"The Office\" starred ?",
        template: "You are given a question preceded by a set of supporting facts. Answer the question using the supporting facts. Your answer should be no longer than five words.\n{input}",
        target: "Tom Shadyac",
        operator: Operator.CONTAIN,
        taskId: "complexQA_0",
    },
    {
        title: "Complex Question Answering",
        description: "The model is given a context and asked to answer a question that requires reasoning over multiple sentences.",
        input: "Richard Donald Marles (born 13 July 1967) is an Australian politician and the Shadow Minister for Defence and was formerly the Shadow Minister for Immigration and Border Protection.\n\nPyne & Marles was an Australian television political commentary which was broadcast weekly on Sky News Live. The program was co-hosted by two serving frontbench MPs, Liberal minister Christopher Pyne and Labor shadow minister Richard Marles, without a journalist or moderator. It covered the political issues of the week.\n\nAndrew John Southcott (born 15 October 1967) is an Australian politician and medical practitioner. He was elected as the Liberal member for the House of Representatives seat of Boothby in the 1996 election.\n\nChristopher Maurice Pyne (born 13 August 1967) is an Australian politician who was elected as the Liberal member for the House of Representatives seat of Sturt in the 1993 election.\n\nNickolas Varvaris (born 25 May 1974) is a former Australian politician. He was elected as the Liberal member for the House of Representatives seat of Barton in 2013.\n\nThere was a show on Sky News that was co-hosted by Richard Marles and an Australian politician, born in 1967, who has been a Liberal member for the House of Representatives since what year's election?",
        template: "You are given a question preceded by a set of supporting facts. Answer the question using the supporting facts. Your answer should be no longer than five words.\n{input}",
        target: "1993",
        operator: Operator.CONTAIN,
        taskId: "complexQA_1",
    },
    {
        title: "Complex Question Answering",
        description: "The model is given a context and asked to answer a question that requires reasoning over multiple sentences.",
        input: "Alfred (Alfred Ernest Albert; 6 August 1844 - 30 July 1900) reigned as Duke of Saxe- Coburg and Gotha from 1893 to 1900. He was the second son and fourth child of Queen Victoria of the United Kingdom and Prince Albert of Saxe - Coburg and Gotha. He was known as the Duke of Edinburgh from 1866 until he succeeded his paternal uncle Ernest II as the reigning Duke of Saxe - Coburg and Gotha in the German Empire.\n\nJohn Wickham Legg (28 December 1843 - 28 October 1921) was the third son of the printer and bookseller George Legg, and was born at Alverstoke near Portsmouth in Hampshire, England, on 28 December 1843. He was educated at Winchester College and from there he went to New College, Oxford and subsequently opted to read Medicine at University College, London, where he studied under Sir William Jenner. Having qualified as a member of the Royal College of Surgeons, he was recommended by Jenner for the post of medical attendant to Prince Leopold, Queen Victoria's fourth son, later styled Duke of Albany, a haemophiliac. Though the appointment lasted only a year, the young Legg became a favourite of the Prince's wife, Princess Helen, and of their daughter, Princess Alice, Countess of Athlone.\n\nPrince Leopold, Duke of Albany, (Leopold George Duncan Albert; 7 April 1853 - 28 March 1884) was the eighth child and youngest son of Queen Victoria and Prince Albert of Saxe - Coburg and Gotha. Leopold was later made Duke of Albany, Earl of Clarence, and Baron Arklow. He had haemophilia, which led to his death at the age of 30.\n\nJohn Wickham Legg was recommended by Jenner for the post of medical attendant to which son of Queen Victoria and Prince Albert of Saxe - Coburg and Gotha ?", 
        template: "You are given a question preceded by a set of supporting facts. Answer the question using the supporting facts. Your answer should be no longer than five words.\n{input}",
        target: "Prince Leopold",
        operator: Operator.CONTAIN,
        taskId: "complexQA_2",
    },
    {
        title: "Complex Question Answering",
        description: "The model is given a context and asked to answer a question that requires reasoning over multiple sentences.",
        input: "Charles Alfred Dodgsons Walton (December 11, 1921 - November 6, 2011) is best known as the first patent holder for the RFID (radio frequency identification) device. Many individuals contributed to the invention of the RFID, but Walton was awarded ten patents in all for various RFID- related devices, including his key 1973 design for a \"Portable radio frequency emitting identifier\". This patent was awarded in 1983, and was the first to bear the acronym \"RFID\". He founded the company Proximity Devices, Inc., in Sunnyvale, California in 1970, to manufacture devices based on his patents.\n\nVerifone is an American multinational corporation headquartered in San Jose, California that provides technology for electronic payment transactions and value - added services at the point - of - sale.\n\nAdyen, an international payments platform based in Amsterdam, announced a deal to roll out a global payments system for McDonald's, the iconic home of the Big Mac, which will launch in the U.K.starting in the first quarter of 2020. \n\nSpeedpass is a keychain RFID device introduced in 1997 by Mobil Oil Corp. (which merged with Exxon to become ExxonMobil in 1999) for electronic payment. It was originally developed by Verifone. At one point, Speedpass was deployed experimentally in fast - food restaurants and supermarkets in select markets. McDonald's alone deployed Speedpass in over 400 Chicago area restaurants. The test was deemed a failure and McDonald's removed the scanners from all their restaurants in mid - 2004.\n\nThe company that created a keychain RFID device created to allow electronic payment at McDonald's and 400 other Chicago area restaurants is headquartered in what city and state?",
        template: "You are given a question preceded by a set of supporting facts. Answer the question using the supporting facts. Your answer should be no longer than five words.\n{input}",
        target: "San Jose, California",
        operator: Operator.CONTAIN,
        taskId: "complexQA_3",
    },
]

const LongFormText: PredefinedTask[] = [
    {
        title: "Long Form Text Comprehension",
        description: "Given a long text spanning multiple paragraphs, the goal is to answer what a specific phrase refers to.",
        input: "OPEC's ability to produce more petroleum than it can sell is beginning to cast a shadow over world oil markets. Output from the Organization of Petroleum Exporting Countries is already at a high for the year and most member nations are running flat out. But industry and OPEC officials agree that a handful of members still have enough unused capacity to glut the market and cause an oil-price collapse a few months from now if OPEC doesn't soon adopt a new quota system to corral its chronic cheaters.\n\nAs a result, the effort by some oil ministers to get OPEC to approve a new permanent production-sharing agreement next month is taking on increasing urgency. The organization is scheduled to meet in Vienna beginning Nov.25. So far this year, rising demand for OPEC oil and production restraint by some members have kept prices firm despite rampant cheating by others. But that could change if demand for OPEC's oil softens seasonally early next year as some think may happen. OPEC is currently producing more than 22 million barrels a day, sharply above its nominal, self-imposed fourth-quarter ceiling of 20.5 million, according to OPEC and industry officials at an oil conference here sponsored by the Oil Daily and the International Herald Tribune.\n\nAt that rate, a majority of OPEC's 13 members have reached their output limits, they said. But it is estimated that at least three million barrels a day -- and possibly as much as seven million barrels a day -- of spare capacity still exists within OPEC. Most is concentrated in five Persian Gulf countries, including his own, Issam Al-Chalabi, Iraq's oil minister, told the conference Friday. He puts OPEC's current capacity at 28 million to 29 million barrels a day. That's higher than some other estimates. Ali Khalifa Al - Sabah, Kuwait's oil minister, recently estimated OPEC capacity at 25 million barrels a day. Either way, the overhang is big enough to keep delicately balanced oil markets on edge.",
        template: "At the end of the following passage:\n{input}\nWhat does the overhang refer to?\nYour answer should contain at most 5 words. If you cannot answer give an empty response.",
        target: "capacity",
        operator: Operator.CONTAIN,
        taskId: "longFormTextComprehension_0",
    },
    {
        title: "Long Form Text Comprehension",
        description: "Given a long text spanning multiple paragraphs, the goal is to answer what a specific phrase refers to.",
        input: "The Polish rat will eat well this winter. Tons of delectably rotting potatoes, barley and wheat will fill damp barns across the land as thousands of farmers turn the state's buyers away. Many a piglet won't be born as a result, and many a ham will never hang in a butcher shop. But with inflation raging, grain in the barn will still be a safer bet for the private farmer than money in the bank. \n\nOnce again, the indomitable peasant holds Poland's future in his hands. Until his labor can produce a profit in this dying and distorted system, even Solidarity's sympathetic new government won't win him over. In coming months, emergency food aid moving in from the West will be the one buffer between a meat-hungry public and a new political calamity. Factory workers on strike knocked Poland's Communist bosses off balance last year; this year, it was the farmers who brought them down. In June, farmers held onto meat, milk and grain, waiting for July's usual state-directed price rises. The Communists froze prices instead. The farmers ran a boycott, and meat disappeared from the shops. On Aug. 1, the state tore up its controls, and food prices leaped. Without buffer stocks, inflation exploded. That was when the tame old Peasants' Party, desperate to live through the crisis, broke ranks with the Communists and joined with Solidarity in the East Bloc's first liberated government. \n\nBut by the time Solidarity took office in September, the damage was done. \"Shortageflation,\" as economists have come to call it, had gone hyper. The cost of raising a pig kept bounding ahead of the return for selling one. The farmers stayed angry. They still are. At dawn on a cool day, hundreds travel to the private market in Radzymin, a town not far from Warsaw, hauling pigs, cattle and sacks of feed that the state's official buyers can't induce them to sell. Here, they are searching for a higher price. In a crush of trucks and horse carts on the trodden field, Andrzej Latowski wrestles a screeching, overweight hog into the trunk of a private butcher's Polish Fiat. \"Of course it's better to sell private, \" he says, as the butcher trundles away. \"Why should anybody want to sell to them ? \" The young farmer makes money on the few hogs he sells here. He won't for long, because his old state sources of rye and potatoes are drying up. \"There's no feed,\" he says. \"You can't buy anything nowadays. I don't know why.\" \n\nEdward Chojnowski does. His truck is parked across the field, in a row of grain sellers. Like the others, it is loaded with rye, wheat and oats in sacks labeled \"Asbestos. Made in U.S.S.R.\" The farmer at the next truck shouts, \"Wheat! It's nice! It won't be cheaper! We sell direct!\" A heavy, kerchiefed woman runs a handful through her fingers, and counts him out a pile of zlotys. \"Country people breed pigs,\" says Mr.Chojnowski, leaning against the back of his truck. \"They can't buy feed from the state. There isn't enough. Some state middlemen come to buy from me. I sell -- a little. I am waiting. I have plenty more at home.\" On this morning, he doesn't sell much in Radzymin, either. At closing time, farmers cart out most of what they carted in.",
        template: "In the following passage:\n{input}\nWhat are farmers unable to produce?\nYour answer should contain at most 5 words. If you cannot answer give an empty response.",
        target: "pig",
        operator: Operator.CONTAIN,
        taskId: "longFormTextComprehension_1",
    },
    {
        title: "Long Form Text Comprehension",
        description: "Given a long text spanning multiple paragraphs, the goal is to answer what a specific phrase refers to.",
        input: "Yet another political scandal is racking Japan. But this time it's hurting opposition as well as ruling-party members. And as it unfolds, it's revealing some of the more tangled and seamier aspects of Japanese society. Already, the ruling Liberal Democratic Party's (LDP) demands that opposition members testify under oath in parliament have stalled one budget committee session and forced the committee to plan a special two-day investigation at the end of the month. But the scandal itself is so convoluted that ruling-party members are divided between those who want to pursue the matter in hope of undermining the opposition and those who favor leaving well enough alone. \"The opposition can be the most hurt because everyone already figures the LDP is that kind of beast, \" says Shigezo Hayasaka, former aide to LDP kingmaker Kakuei Tanaka and now an independent analyst. But, he adds, \"We can't tell where it will go at all because we're still in the middle of it.\" \n\nThis time, the scandal centers on donations made by the not- quite - mainstream pachinko parlor industry.Pachinko, a kind of pinball, is Japan's favorite form of quasi legal gambling. The donations so far appear to be small, especially compared with the huge sums that changed hands in the Recruit Co. influence-peddling scandal that plagued the ruling party last year. But the implications could be great. Pachinko is slightly on the shady side, often linked to the lower ranks of Japan's underworld and regularly at the top of annual lists of tax evaders.Recently the industry has faced the threat of new restrictions, and political donations may have been made with the intent to bribe.\n\nTo many Japanese, pachinko is benign or enticingly unsavory.Garish neon pachinko marquees blaze from the main streets and narrow alleys of cities and towns across the country.Devotees pass hours, watching the lights blink and listening to the metal balls ping, as much to gamble as to get a little time to be anonymous, alone with their thoughts.At 500 yen($3.60) for a handful of balls, pachinko is a common pastime, and has been since it took root as cheap entertainment in the years after World War II.But the total of all those pinging balls has created an industry with a reported annual income of 13 trillion yen(almost $92 billion), or nearly the size of Japan's vaunted automobile industry. And because the pachinko industry is regularly at the top of annual lists for tax evasion, some observers estimate the real income could be as much as 20 trillion yen. If that money were being taxed, it could bring the government a badly needed several trillion yen. In 1984, an attempt was made to crack down on the industry with tougher restrictions. Then, in 1988, a proposal to keep better track of income by selling prepaid cards for pachinko was fielded in parliament.",
        template: "In the following passage:\n{input}\nWhat industry is involved in the scandal ?\nYour answer should contain at most 5 words.If you cannot answer give an empty response.",
        target: "pachinko",
        operator: Operator.CONTAIN,
        taskId: "longFormTextComprehension_2",
    }

    
]

// const FOLIO 
export function getTask(taskIntId : number, getStudyTask : boolean) : PredefinedTask{
    let taskArray;
    if (getStudyTask) {
        switch (taskIntId) {
            case 0:
                taskArray = exampleTasks; break;
            case 1:
                taskArray = SQUAD; break;
            case 2:
                taskArray = restaurantReview; break;
            case 3:
                taskArray = PromptEngineering; break;
            case 4:
                taskArray = ComplexQA; break;
            case 5:
                taskArray = LongFormText; break;
            default:
                throw new Error("Task int index is out of bounds");
        }
        return taskArray[getRandomInt(taskArray.length)];
    }
    switch (taskIntId) {
        case 0:
            taskArray = exampleTasks; break;
        case 1:
            taskArray = SQUAD; break;
        case 2:
            taskArray = GridPuzzle; break;
        case 3:
            taskArray = restaurantReview; break;
        case 4:
            taskArray = PromptEngineering; break;
        case 5:
            taskArray = ComplexQA; break;
        case 6:
            taskArray = LongFormText; break;
        default:
            throw new Error("Task int index is out of bounds");
    }
    return taskArray[getRandomInt(taskArray.length)];


}