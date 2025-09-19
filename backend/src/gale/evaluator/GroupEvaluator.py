import logging
import warnings
import enum
import numpy as np
import torch
import matplotlib.pyplot as plt
import os
from os.path import join as pjoin

from ..util import standardize_groups, l1, l2

lg = logging.getLogger(__name__)

output_dir = pjoin("local", "outputs")


class BitVectorSamplingType(enum.Enum):
    DELETION = "deletion"
    INSERTION = "insertion"


class GroupEvaluator:
    def __init__(
        self,
        model,
        inputs,
        group_assignments: list[list[int]],
        group_attributions: list[np.ndarray],
        mask_value: str,
        merge_masks=False,
        environment_setup_hook=None,
        debug=False,
    ):
        """
        Parameters
        ----------
        model : The model to explain. It should be a callable method that takes a list of strings as input or a list of tokens as pytorch tensors.
        I.e. model("".join(inputs[0])) should return the original prediction of the first input or model(inputs[0]).

        inputs : The inputs to for which to run the evaluation. Each input should be a list of strings.

        group_assignments : The groups assignments for each input.
        Each input should have a list of integers where each integer represents the group assignment of the corresponding feature.

        group_attributions : The attributions of the groups.

        mask_value : The value to use to mask features when their group is not present.

        merge_masks : Whether to merge the masks or not. If True, merges sequences of masks into a single mask. Default is False.

        environment_setup_hook : A hook to set up the environment before running the model on i-th input. For example if you have a separate prompt for each input this function can set the prompt before the model runs. The function should only take the input index as input. Default is None.

        """
        self.model = model
        self.inputs = inputs
        self.n_inputs = len(inputs)
        self.input_lengths = [len(input) for input in inputs]
        self.is_token = isinstance(inputs[0], torch.Tensor)
        self.group_assignments = [
            standardize_groups(groups_assignment) for groups_assignment in group_assignments
        ]
        self.group_attributions = group_attributions
        self.n_constituents_by_group = self.get_number_of_constituents_by_group()
        self.mask_value = mask_value
        self.merge_masks = merge_masks
        self.environment_setup_hook = environment_setup_hook
        if debug:
            logging.basicConfig(level=logging.ERROR)
            # To avoid shaps debug prints
            lg.setLevel(logging.DEBUG)

    def get_size_percentages(self, group_assignments):
        """Get the size of each group as a percentage of the total number of features."""
        n_features = len(group_assignments)
        n_groups = len(set(group_assignments))
        n_features_by_group = np.zeros(n_groups)
        for i in range(n_features):
            n_features_by_group[group_assignments[i]] += 1
        return n_features_by_group / n_features

    def get_group_rankings(self, is_descedning=True, flip_signs=False):
        """Define the rankings of the groups for each input based on the attribution scores. This is only done conditionally
        as directions like Random do not require this."""
        if flip_signs:
            # Only possible if run get_original_predictions first
            for i in range(self.n_inputs):
                if (
                    self.original_predictions[i] < 0.5
                ):  # If predict negative class, flip the signs of the attributions
                    self.group_attributions[i] = -self.group_attributions[i]
        if is_descedning:
            # Reverse the order to go from highest value to lowest
            # fmt: off
            return [np.argsort(self.group_attributions[i])[::-1]for i in range(self.n_inputs)]
        else:
            # fmt: off
            return [np.argsort(self.group_attributions[i]) for i in range(self.n_inputs)]

    def get_monotonic_size_by_ranking(self, sizes):
        """Given a size (percentage or number of features) of each group, return the summed sizes in a monotonic order according to self.ranking."""
        monotonic_sizes_by_input = []
        for i in range(self.n_inputs):
            monotonic_sizes = np.zeros(len(sizes[i]))
            prev_size = 0
            for j in range(len(sizes[i])):
                monotonic_sizes[j] = prev_size + sizes[i][self.rankings[i][j]]
                prev_size = monotonic_sizes[j]
            monotonic_sizes_by_input.append(monotonic_sizes)
        return monotonic_sizes_by_input

    def get_number_of_constituents_by_group(self):
        """Get the number of constituents by group."""
        n_constituents_by_group = []
        for i in range(self.n_inputs):
            n_constituents = np.zeros(
                len(set(self.group_assignments[i])), dtype=np.int32
            )  # len(set(self.group_assignments[i])) is the number of groups
            for j in range(self.input_lengths[i]):
                n_constituents[self.group_assignments[i][j]] += 1
            n_constituents_by_group.append(n_constituents)
        return n_constituents_by_group

    # TODO: Put the mask_to_input function from the explainer in a separate file and import it here (and there) to avoid code duplication
    def mask_input_by_allowed_groups_string(self, input_index, allowed_groups):
        """Mask the input at the given index by masking all the features that are not in the allowed groups."""
        result_string = ""
        prev_was_masked = False
        for i in range(self.input_lengths[input_index]):
            if self.group_assignments[input_index][i] in allowed_groups:
                result_string += self.inputs[input_index][
                    i
                ]  # Assumes necessary spaces are included in the input parts
            else:
                # lg.debug(f"masking: {self.inputs[input_index][i]}")
                if self.merge_masks and prev_was_masked:
                    continue
                result_string += self.mask_value
        return result_string

    def mask_input_by_allowed_groups_tokens(self, input_index, allowed_groups):
        input = []
        prev_was_masked = False
        for i in range(self.input_lengths[input_index]):
            # If mask is False, then the input is replaced with the mask value for that input
            # Else the input is included as is
            # fmt: off
            if not self.group_assignments[input_index][i] in allowed_groups:
                if not prev_was_masked or (not self.merge_masks):
                    # Place the mask value if 1. not merging masks or 2. merging masks but the previous input was not masked
                    if self.mask_value is not None: # Use mask value None to drop tokens completely
                        input.append(self.mask_value)
                prev_was_masked = True
            else:
                input.append(self.inputs[input_index][i])
                prev_was_masked = False
        # lg.debug(f"Input generated from mask: {input}")
        if len(input) == 1:
            return input[0].unsqueeze(0)
        return torch.stack(input)

    def generate_perturbations(self, step_size, cut_off):
        """Generate the perturbed inputs for the insertion direction."""
        # TODO change to cut_off here as well
        groups_rankings = self.rankings
        perturbed_inputs = []
        self.allowed_groups_by_input = []
        for i in range(self.n_inputs):
            input_i_perturbations = []
            cur_index = step_size  # Begin with first step_size many groups
            n_changed = 0  # If deletion this is number of deleted features, if insertion this is number of inserted features
            allowed_groups_by_perturbation = []
            while n_changed / self.input_lengths[i] < cut_off:

                if self.direction == BitVectorSamplingType.INSERTION:
                    # Only allow the groups up to cur_index (inserting the first cur_index many groups)
                    allowed_groups = groups_rankings[i][:cur_index]
                elif self.direction == BitVectorSamplingType.DELETION:
                    # Only allow the groups past the current index (deleting the first cur_index many groups)
                    allowed_groups = groups_rankings[i][cur_index:]
                else:
                    raise NotImplementedError(
                        "Only deletion and insertion directions are implemented."
                    )
                allowed_groups_by_perturbation.append(allowed_groups)
                if self.is_token:
                    # fmt: off
                    input_i_perturbations.append(
                        self.mask_input_by_allowed_groups_tokens(i, allowed_groups)
                    )
                else:
                    # fmt: off
                    input_i_perturbations.append(
                        self.mask_input_by_allowed_groups_string(i, allowed_groups)
                    )
                size_of_inserted_groups = [
                    self.n_constituents_by_group[i][groups_rankings[i][j]]
                    for j in range(cur_index - step_size, cur_index)
                ]
                # fmt: off
                n_changed += sum(size_of_inserted_groups)
                cur_index += step_size
            self.allowed_groups_by_input.append(allowed_groups_by_perturbation)
            perturbed_inputs.append(input_i_perturbations)
        return perturbed_inputs

    def get_original_predicitons(self):
        all_predictions = []
        for i in range(self.n_inputs):
            if self.environment_setup_hook is not None:
                self.environment_setup_hook(i)
            if self.is_token:
                all_predictions.append(self.model(self.inputs[i].unsqueeze(0)))
            else:
                all_predictions.append(self.model(["".join(self.inputs[i])]))
        return all_predictions

    def compute_difference_original_to_perturbed(
        self, perturbed_inputs, original_predictions, difference_metric=None
    ):
        """Compute the difference of the explanation on the perturbed inputs as the difference between the original prediction and the perturbed prediction."""
        if difference_metric is None:
            difference_metric = l1

        differences_by_input = []
        for i in range(self.n_inputs):
            if self.environment_setup_hook is not None:
                # Set up the environment before running the model on the i-th input
                self.environment_setup_hook(i)
            perturbations = perturbed_inputs[i]
            original_prediction = original_predictions[i]
            differences_by_perturbation = np.zeros(len(perturbations))
            perturbed_predictions = self.model(perturbations)

            for j, perturbed_prediction in enumerate(perturbed_predictions):
                difference = difference_metric(original_prediction, perturbed_prediction)
                differences_by_perturbation[j] = difference
            differences_by_input.append(differences_by_perturbation)
        return differences_by_input

    def evaluate(
        self,
        direction: str,
        step_size: int | list[int],
        cut_off: int | float,
        is_descedning=True,
        flips_signs=False,
    ):
        """
        Parameters
        ----------
        direction : The direction to use to explain the model's predictions on the input groups. Options are "Random", "Deletion", and "Insertion".

        step_size : The number of features to remove or add in each iteration. If provided as an integer, the same step size is used for all iterations. If provided as a list, the step size at each iteration is taken from the list. Not implemented yet

        cut_off : If provided as a float gives the percentage of atomic features at which to stop the perturbations. If provided as an integer, gives the number of atomic features at which to stop the perturbations.

        is_descedning : Whether the groups should be ranked in descending order of importance. Default is True. If False, use ascending order

        """
        perturbed_inputs = None
        self.direction = BitVectorSamplingType(direction.lower())
        self.original_predictions = self.get_original_predicitons()
        if direction.lower() == "random":
            raise NotImplementedError("Random direction is not implemented yet.")
        self.rankings = self.get_group_rankings(is_descedning, flip_signs=flips_signs)
        perturbed_inputs = self.generate_perturbations(step_size, cut_off)

        self.diff = self.compute_difference_original_to_perturbed(
            perturbed_inputs, self.original_predictions
        )
        return self.diff

    def compute_area(self, use_percentages=True):
        from sklearn.metrics import auc

        """Compute the area as the difference value times the number of constituents of the group or the percentage of the group."""
        if self.diff is None:
            raise ValueError("No errors_by_input provided, run evaluate first.")
        if use_percentages:
            sizes = [self.get_size_percentages(groups) for groups in self.group_assignments]
        else:
            sizes = self.n_constituents_by_group
        monotonic_sizes_by_input = self.get_monotonic_size_by_ranking(sizes)
        area_by_input = np.zeros(self.n_inputs)
        for i in range(self.n_inputs):
            area_by_input[i] = auc(monotonic_sizes_by_input[i], self.diff[i])

        return area_by_input

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

    def collect_results_in_bins(self, percentages, bin_size=0.05, n_bins=10):
        """Collect the results in bins of size bin_size in n_bins."""
        bins = np.zeros(n_bins)
        n_items_in_bin = np.zeros(n_bins, dtype=int)
        values_in_bin = {i: [] for i in range(n_bins)}  # To calculate the standard deviation
        for i, differences in enumerate(self.diff):
            for j in range(len(differences)):
                # TODO: Need to sum up all the percentages of the groups that are removed and j should be based on the perturbation allowed groups
                allowed_groups = self.allowed_groups_by_input[i][j]
                percentage = sum([percentages[i][c] for c in allowed_groups])
                if self.direction == BitVectorSamplingType.DELETION:
                    # In this case the percentage a above is the percentage of the features that are left after removal (the ones that are still allowed)
                    # So we need to subtract it from 1 to get the percentage of the features that are removed
                    percentage = 1.0 - sum([percentages[i][c] for c in allowed_groups])
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

    def collect_with_interpolation(self, percentages):
        x_axes = []
        y_axes = []
        for i, differences in enumerate(self.diff):
            x_axis = []
            y_axis = []
            for j in range(len(differences)):
                percentage = sum([percentages[i][c] for c in self.allowed_groups_by_input[i][j]])
                if self.direction == BitVectorSamplingType.DELETION:
                    percentage = 1.0 - percentage
                x_axis.append(percentage)
                y_axis.append(differences[j])
            x_axes.append(x_axis)
            y_axes.append(y_axis)
        value_at_zero = 0.0 if self.direction == BitVectorSamplingType.DELETION else 1.0
        mean_x_axis = [i * 0.05 for i in range(1, 21)]
        ys_interp = [np.interp(mean_x_axis, x_axes[i], y_axes[i]) for i in range(len(x_axes))]
        mean_y_axis = np.mean(ys_interp, axis=0)
        std_y_axis = np.std(ys_interp, axis=0)
        mean_x_axis.insert(0, 0.0)
        mean_y_axis = np.insert(mean_y_axis, 0, value_at_zero)
        std_y_axis = np.insert(std_y_axis, 0, 0.0)
        return mean_x_axis, mean_y_axis, std_y_axis

    def to_graph(self, bin_size=0.1, std_display="area", output_location=None):
        """
        Plot the graph of the differences in prediction at each percentage of the features perturbed averaged over all samples.
        If bin_size == 0.0, the graph is plotted using interpolation. If bin_size is not 0.0, the graph is plotted with equal width binning.
        """
        percentages = [self.get_size_percentages(groups) for groups in self.group_assignments]
        if bin_size == 0.0:
            x_axis, y_axis, std = self.collect_with_interpolation(percentages)
            n_items_in_bin = None
        else:
            n_bins = int(1.0 / bin_size) + 1
            x_axis, y_axis, std, n_items_in_bin = self.collect_results_in_bins(
                percentages, bin_size=bin_size, n_bins=n_bins
            )
        # print(f"percentages: {percentages}")

        plt.figure(figsize=(10, 6))
        if bin_size == 0.0:
            marker = None
        else:
            marker = "o"
        plt.plot(x_axis, y_axis, marker=marker, linestyle="-")
        plt.ylim(ymin=0, ymax=(max(y_axis) + max(std) - 0.05))
        plt.xlim(xmin=0, xmax=1.01)
        plt.xticks(x_axis)
        if std is not None and std_display is not None:
            print("std: ", std)
            if std_display == "area":
                plt.fill_between(
                    x_axis,
                    np.array(y_axis) - np.array(std),
                    np.array(y_axis) + np.array(std),
                    alpha=0.2,
                )
            elif std_display == "bar":
                plt.errorbar(x_axis, y_axis, yerr=std, fmt="o")
            else:
                raise ValueError(f"Got unsupported std_display format {std_display}")

        if n_items_in_bin is not None:
            for i in range(len(n_items_in_bin)):
                plt.text(
                    x_axis[i],
                    y_axis[i] + 0.03,
                    f"{n_items_in_bin[i]}",
                    fontsize=10,
                    # horizontalalignment="right",
                )
        plt.xlabel(f"Percentage of {self.direction.name.lower()} features")
        plt.ylabel("Difference in Prediction")
        plt.title(
            f"Difference in Prediciton at each percentage of {self.direction.name.lower()} features"
        )
        plt.grid(True, which="both")
        final_output_dir = output_dir
        if output_location is not None:
            final_output_dir = pjoin(output_dir, output_location)
        os.makedirs(final_output_dir, exist_ok=True)
        if bin_size == 0.0:
            graph_name = f"{self.direction.name.lower()}_graph_n{self.n_inputs}.png"
        else:
            graph_name = f"{self.direction.name.lower()}_graph_bins{bin_size}_n{self.n_inputs}.png"
        plt.savefig(
            pjoin(
                final_output_dir,
                graph_name,
            )
        )
        plt.show()

    def to_individual_graphs(self, output_location):
        """
        Separately plot each sample's graph of the differences in prediction at each percentage of features perturbed.
        """
        percentages = [self.get_size_percentages(groups) for groups in self.group_assignments]
        final_output_dir = pjoin(output_dir, output_location)
        os.makedirs(final_output_dir, exist_ok=True)
        for i, differences in enumerate(self.diff):
            x_axis = []
            y_axis = []
            for j in range(len(differences)):
                percentage = sum([percentages[i][c] for c in self.allowed_groups_by_input[i][j]])
                if self.direction == BitVectorSamplingType.DELETION:
                    percentage = 1.0 - percentage
                x_axis.append(percentage)
                y_axis.append(differences[j])
            plt.figure(figsize=(10, 6))
            plt.plot(x_axis, y_axis, marker="o", linestyle="-")
            plt.xlabel(f"Percentage of {self.direction.name.lower()} features")
            plt.ylabel("Difference in Prediction")
            plt.title(
                f"Difference in Prediciton at each percentage of {self.direction.name.lower()} features"
            )
            plt.grid(True)
            os.makedirs(final_output_dir, exist_ok=True)
            graph_name = f"samples{i}.png"  # direction should be given in name of directory

            plt.savefig(
                pjoin(
                    final_output_dir,
                    graph_name,
                )
            )
