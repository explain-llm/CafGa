from src.services.tasks import TaskHandler
from ..datatypes.text import Operator, Task
from ..datatypes.tree import Node
# from src.colab.parser.parser import parse_passage
import re


def attribute_and_evaluate(
    task: Task,
    assignments: list[int],
    model_to_explain: str,
    direction: str,
):
    model = ""
    match model_to_explain:
        case "GPT35_turbo":
            model = "gpt-3.5-turbo"
        case "GPT4o":
            model = "gpt-4o"
        case "GPT4o_mini":
            model = "gpt-4o-mini"
        case "GPT41":
            model = "gpt-4.1"
        case "GPT41_mini":
            model = "gpt-4.1-mini"
        case "GPT41_nano":
            model = "gpt-4.1-nano"
        case _:
            model = "gpt-4o-mini"

    task_handler = TaskHandler(model_to_explain=model)
    attributions, original_prediction, computation_time, n_generated_samples = (
        task_handler.get_attributions(task, assignments)
    )
    differences = task_handler.get_evaluation(
        [task.inputSegments],
        [assignments],
        [task.template],
        [attributions],
        [task.target],
        [task.operator],
        direction,
    )
    differences = differences[0]

    return (
        attributions,
        original_prediction,
        computation_time,
        n_generated_samples,
        differences,
    )


# def get_colab_parse(input_string):
#     root = Node(children=[], textIds=[], nodeId="-1", parent=None)
#     id_to_node = {}
#     base_parse = parse_passage(input_string)
#     groups = []
#     for node_id, parse_group in enumerate(base_parse["nodes"]):
#         # Do not set parent here as it will cause a circular reference which makes the model un-serializable
#         new_node = Node(children=[], textIds=[], nodeId=str(node_id), parent=None)
#         if parse_group["parent"] is not None:
#             parent_id = parse_group["parent"]
#             id_to_node[parent_id].children.append(new_node)
#         else:
#             root.children.append(new_node)
#         ids = []
#         children = parse_group["children"]
#         if len(children) != 0:
#             for child in children:
#                 if child["type"] == "span":
#                     ids.append(child["id"])
#         else:
#             ids = [parse_group["data"]["spans"][0]]
#         groups.append(ids)
#         new_node.textIds = ids
#         id_to_node[node_id] = new_node
#     colab_atomics: list[str] = [span["text"] for span in base_parse["spans"]]
#     n_values = len(colab_atomics)
#     assignments = -1 * np.ones(n_values, dtype=int)
#     for i, group in enumerate(groups):
#         for value in group:
#             assignments[value] = i
#     straggler_index = len(groups)
#     for i, assignment in enumerate(assignments):
#         if assignment == -1:
#             straggler_node = Node(
#                 children=[], textIds=[i], nodeId=str(straggler_index), parent=None
#             )
#             id_to_node[0].children.append(straggler_node)
#             straggler_index += 1
#     # Solve the issue where "." is missing the space at the end which messes up the parsing when the input is parsed again
#     for i, atomic in enumerate(colab_atomics[:-1]):
#         if atomic.endswith("."):
#             colab_atomics[i] = atomic+" "
#     return colab_atomics, root


def parse(unparsed_input: str, task: Task):
    """
    Given the unparsed input and the task, parse the input and get the model's original prediction for the task.
    The results are directly updated in the task object.
    """
    # The colab parser crashes when the input is a single word
    # In case the input is a single word, we just use the input as the parse

    print(repr(unparsed_input))
    if len(unparsed_input.split()) == 1:
        task.inputSegments = [unparsed_input]
        task.predefinedEditHierarchy = None
    else:
        # colab_parse, colab_edit_tree = get_colab_parse(unparsed_input)
        # task.inputSegments = colab_parse
        # task.predefinedEditHierarchy = colab_edit_tree
        print("Raw unparsed input: ", repr(unparsed_input))
        unparsed_input = unparsed_input.strip()
        unparsed_input = re.sub("\n\n+","\n\n",unparsed_input)
        paragraphs = unparsed_input.split("\n\n")
        inputSegments = []
        for i,paragraph in enumerate(paragraphs):
            re_S = re.compile(r"(\S+)")
            newSegments_with_white_space = re_S.split(paragraph)
            newSegments = []
            for j in range(1, len(newSegments_with_white_space) - 1, 2):
                newSegments.append(newSegments_with_white_space[j] + newSegments_with_white_space[j+1])
            if i != len(paragraphs)-1:
                newSegments[len(newSegments)-1] += "\n\n"
            inputSegments += newSegments

        task.inputSegments = inputSegments
        task.predefinedEditHierarchy = None
