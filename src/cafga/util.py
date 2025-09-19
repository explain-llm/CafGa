import numpy as np
import enum
import re
from nltk.tokenize import sent_tokenize

class BitVectorSamplingType(enum.Enum):
    DELETION = "deletion"
    INSERTION = "insertion"


def l1(a: float, b: float) -> float:
    return np.abs(a - b)


def l2(a: float, b: float) -> float:
    diff = a - b
    return np.sqrt(diff * diff)

justify_fns = {
    "START_WITH": lambda resp, value: resp.startswith(value),
    "END_WITH": lambda resp, value: resp.endswith(value),
    "EQUAL": lambda resp, value: resp == value,
    "CONTAIN": lambda resp, value: value in resp,
}
NLI_fns = ["SEMANTIC_EQUAL", "ENTAIL", "CONTRADICT"]


def evaluate_outcome(resps: list[str], operator : str, target : str, NLI_model=None):
    if type(resps) is str:
        resps = [resps]

    value = target.lower()

    if operator in justify_fns:
        justify_fn = justify_fns[operator]
        justifications = [justify_fn(resp, value) for resp in resps]
        return sum(justifications) / len(justifications)
    elif operator in NLI_fns:
        if NLI_model is None:
            raise ValueError(f"Trying to run NLI method: {operator} but no NLI model is defined")
        NLI_predictions = []
        for resp in resps:
            prediction = NLI_model([dict(text=resp, text_pair=value)], top_k=None)
            if operator == "ENTAIL":
                for labelled_score in prediction[0]:
                    if labelled_score["label"] == "entailment":
                        NLI_predictions.append(labelled_score["score"])
            elif operator == "CONTRADICT":
                for labelled_score in prediction[0]:
                    if labelled_score["label"] == "contradiction":
                        NLI_predictions.append(labelled_score["score"])
            elif operator == "SEMANTIC_EQUAL":
                predction_backward = NLI_model([dict(text=value, text_pair=resp)], top_k=None)
                foward_score = 0.0
                for labelled_score in prediction[0]:
                    if labelled_score["label"] == "entailment":
                        foward_score = labelled_score["score"]
                for labelled_score in predction_backward[0]:
                    if labelled_score["label"] == "entailment":
                        backward_score = labelled_score["score"]
                aggregate = min([foward_score, backward_score])
                NLI_predictions.append(aggregate)
        return sum(NLI_predictions) / len(NLI_predictions)
    else:
        raise ValueError(f"Operator {operator} not found")


def word_tokenize(passage : str):
    """
    A simplistic word tokenizer that splits the passage by whitespace.
    Importantly it retains the white spaces as part of the segments allowing the sequence to be reconstructed. 
    """
    re_S = re.compile(r"(\S+)")
    segments_with_white_space = re_S.split(passage)
    segments = []
    for j in range(1, len(segments_with_white_space) - 1, 2):
        segments.append(segments_with_white_space[j] + segments_with_white_space[j + 1])
    return segments


def sentence_tokenize(passage : str):
    """
    Tokenize the passage into sentences by using nltk and then trying to recover the white space afterwards. 
    """
    sents = sent_tokenize(passage)
    shredded_passage = passage
    for i,sent in enumerate(sents):
        shredded_passage = shredded_passage[len(sent):]
        if len(shredded_passage) == 0: 
            break
        begin_non_white_space = re.match(r"\s*", shredded_passage, re.UNICODE).end()
        sents[i] += shredded_passage[:begin_non_white_space]
        shredded_passage = shredded_passage[begin_non_white_space:]

    return sents


def paragraph_tokenize(passage : str):
    """
    Tokenize the passage into paragraphs where the end of the paragraph is defined by at least two new lines.
    """
    passage = re.sub("\n\n+", "\n\n", passage)
    paragraphs = passage.split("\n\n")
    for i in range(len(paragraphs) - 1):
        paragraphs[i] = paragraphs[i] + "\n\n"
    return paragraphs


def syntax_tokenize(input_string):
    raise NotImplementedError("This function is currenlty being worked on.")
    from colab.parser.parser import parse_passage

    base_parse = parse_passage(input_string)
    groups = []
    for parse_group in base_parse["nodes"]:
        ids = []
        children = parse_group["children"]
        if len(children) != 0:
            for child in children:
                if child["type"] == "span":
                    ids.append(child["id"])
        else:
            ids = [parse_group["data"]["spans"][0]]
        groups.append(ids)
    colab_atomics = [span["text"] for span in base_parse["spans"]]
    n_values = len(colab_atomics)
    assignments = -1 * np.ones(n_values, dtype=int)
    for i, group in enumerate(groups):
        for value in group:
            assignments[value] = i
    straggler_index = len(groups)
    for i, assignment in enumerate(assignments):
        if assignment == -1:
            assignments[i] = straggler_index
            straggler_index += 1
    return colab_atomics, assignments


def standardize_groups(group_assignments: list[int]) -> list[int]:
    """Standardize the groups assignments to be 0-indexed and contiguous."""
    groups = set(group_assignments)
    n_groups = len(groups)
    groups_dict = dict(zip(groups, range(n_groups)))
    return [groups_dict[c] for c in group_assignments]


def get_size_percentages(group_assignments):
        """Get the size of each group as a percentage of the total number of features."""
        n_features = len(group_assignments)
        n_groups = len(set(group_assignments))
        n_features_by_group = np.zeros(n_groups)
        for i in range(n_features):
            n_features_by_group[group_assignments[i]] += 1
        return n_features_by_group / n_features

def get_group_ranking(attributions : list[float], is_descedning=True):
    """Define the rankings of the groups for each input based on the attribution scores. This is only done conditionally
    as directions like Random do not require this."""

    if is_descedning:
        # Reverse the order to go from highest value to lowest
        return np.argsort(attributions)[::-1]
    else:
        return np.argsort(attributions)

def get_monotonic_size_by_ranking(ranking : list[int], sizes : list[float]):
    """Given a size (percentage or number of features) of each group, return the summed sizes in a monotonic order according to self.ranking."""
    monotonic_sizes = np.zeros(len(sizes))
    prev_size = 0
    for i in range(len(sizes)):
        monotonic_sizes[i] = prev_size + sizes[ranking[i]]
        prev_size = monotonic_sizes[i]
    return monotonic_sizes

def get_number_of_constituents_by_group(group_assignments : list[int]):
    """Get the number of constituents by group."""
    n_constituents = np.zeros(
        len(set(group_assignments)), dtype=np.int32
    )  
    for i in range(len(group_assignments)):
        n_constituents[group_assignments[i]] += 1
    return n_constituents

def mask_input_by_allowed_groups_string(input_segments, group_assignments, allowed_groups, mask_value, merge_masks):
    """Mask the input at the given index by masking all the features that are not in the allowed groups."""
    result_string = ""
    prev_was_masked = False
    for i in range(len(input_segments)):
        if group_assignments[i] in allowed_groups:
            result_string += input_segments[
                i
            ]  # Assumes necessary spaces are included in the input parts
            prev_was_masked = False
        else:
            # lg.debug(f"masking: {self.inputs[input_index][i]}")
            if merge_masks and prev_was_masked:
                continue
            result_string += mask_value
            prev_was_masked = True
    return result_string

# def mask_input_by_allowed_groups_tokens(self, input_index, allowed_groups):
#     input = []
#     prev_was_masked = False
#     for i in range(self.input_lengths[input_index]):
#         # If mask is False, then the input is replaced with the mask value for that input
#         # Else the input is included as is
#         # fmt: off
#         if not self.group_assignments[input_index][i] in allowed_groups:
#             if not prev_was_masked or (not self.merge_masks):
#                 # Place the mask value if 1. not merging masks or 2. merging masks but the previous input was not masked
#                 if self.mask_value is not None: # Use mask value None to drop tokens completely
#                     input.append(self.mask_value)
#             prev_was_masked = True
#         else:
#             input.append(self.inputs[input_index][i])
#             prev_was_masked = False
#     # lg.debug(f"Input generated from mask: {input}")
#     if len(input) == 1:
#         return input[0].unsqueeze(0)
#     return torch.stack(input)

def generate_perturbations(
        input_segments : list[str],
        group_assignments : list[int],
        ranking : list[int],
        mask_value: str, 
        merge_masks: bool, 
        direction : BitVectorSamplingType, 
        step_size : int, 
        cut_off : float
    ):
    """Generate the perturbed inputs for the insertion direction."""
    perturbations = []
    allowed_groups = []
    cur_index = step_size  # Begin with first step_size many groups
    percentages = get_size_percentages(group_assignments)
    percent_perturbed = 0  # If deletion this is number of deleted features, if insertion this is number of inserted features
    while percent_perturbed < cut_off - np.finfo(float).eps:
        if direction == BitVectorSamplingType.INSERTION:
            # Only allow the groups up to cur_index (inserting the first cur_index many groups)
            allowed_groups = ranking[:cur_index]
            percent_perturbed = sum(percentages[allowed_groups])

        elif direction == BitVectorSamplingType.DELETION:
            # Only allow the groups past the current index (deleting the first cur_index many groups)
            allowed_groups = ranking[cur_index:]
            percent_perturbed = 1 - sum(percentages[allowed_groups])
        else:
            raise NotImplementedError(
                "Only deletion and insertion directions are implemented."
            )
        perturbations.append(
            mask_input_by_allowed_groups_string(input_segments,group_assignments, allowed_groups, mask_value, merge_masks)
        )
        cur_index += step_size

    return perturbations

def compute_area(differences : list[float], group_assignments : list[int], ranking : list[int]):
    from sklearn.metrics import auc
    """Compute the area as the difference value times the number of constituents of the group or the percentage of the group."""
    
    percentages = get_size_percentages(group_assignments) 
    monotonic_percentages_by_input = get_monotonic_size_by_ranking(ranking, percentages)
    return auc(monotonic_percentages_by_input, differences)

def collect_results_directly(self, percentages):
    """Collect the results directly without binning."""
    percentage_to_diff = {}  # maps percentage -> [sum of differences, number of differences]
    for i, differences in enumerate(self.diff):
        for j in range(len(differences)):
            percentage = sum([percentages[i][c] for c in self.allowed_groups_by_input[i][j]])
            if self.direction == BitVectorSamplingType.DELETION:
                percentage = 1.0 - percentage
            if percentage not in percentage_to_diff:
                percentage_to_diff[percentage] = [0.0, 0]
            percentage_to_diff[percentage][0] += differences[j]
            percentage_to_diff[percentage][1] += 1
    percentages = sorted(percentage_to_diff.keys())
    avg_diffs = [percentage_to_diff[p][0] / percentage_to_diff[p][1] for p in percentages]
    items_in_bin = [percentage_to_diff[p][1] for p in percentages]
    return percentages, avg_diffs, items_in_bin


def collect_results_in_bins(
    differences_list, percentages_by_step_list, bin_size=0.05, n_bins=10
):
    """Collect the results in bins of size bin_size in n_bins."""
    bins = np.zeros(n_bins)
    n_items_in_bin = np.zeros(n_bins, dtype=int)
    values_in_bin = {i: [] for i in range(n_bins)}  # To calculate the standard deviation
    for i, differences in enumerate(differences_list):
        for j in range(len(differences)):
            percentage = percentages_by_step_list[i][j]
            bin_index = int(percentage / bin_size)
            if bin_index >= n_bins:
                bin_index = n_bins - 1
            bins[bin_index] += differences[j]
            n_items_in_bin[bin_index] += 1
            values_in_bin[bin_index].append(differences[j])
    avg_diffs = bins / n_items_in_bin
    used_bins = []
    used_bin_values = []
    used_bin_values_std = []
    non_zero_n_items = []
    for i in range(n_bins):
        if n_items_in_bin[i] > 0:
            if i < n_bins - 1:
                # Display the bin's x-position as the middle of the bin
                used_bins.append((i + 0.5) * bin_size)
            else:
                used_bins.append(i * bin_size)
            used_bin_values.append(avg_diffs[i])
            var_accumalator = 0
            for value in values_in_bin[i]:
                var_accumalator += (value - avg_diffs[i]) ** 2
            used_bin_values_std.append(np.sqrt(var_accumalator / n_items_in_bin[i]))
            non_zero_n_items.append(n_items_in_bin[i])
    return used_bins, used_bin_values, used_bin_values_std, non_zero_n_items


def collect_with_interpolation(differences_list, percentages_by_step_list):
    x_axes = percentages_by_step_list
    y_axes = differences_list
    mean_x_axis = [i * 0.05 for i in range(21)]
    ys_interp = [np.interp(mean_x_axis, x_axes[i], y_axes[i]) for i in range(len(x_axes))]
    mean_y_axis = np.mean(ys_interp, axis=0)
    std_y_axis = np.std(ys_interp, axis=0)
    return mean_x_axis, mean_y_axis, std_y_axis
