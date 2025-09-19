import numpy as np
import pandas as pd
import shap
import warnings
import torch

from ..util import standardize_groups

warnings.filterwarnings("ignore", category=DeprecationWarning)
warnings.filterwarnings("ignore", category=UserWarning)
warnings.filterwarnings("ignore", category=Warning)


class GroupExplainer:

    def __init__(
        self,
        model,
        model_handles_mask=False,
    ):
        """Uses the KernelExplainer from SHAP to explain the model's predictions on the input groups.

        Parameters
        ----------
        model : The function that takes in a list of inputs and returns the model's predictions. The model function should take in a list of lists of strings, token_ids (as pytorch tensor) or, in case model_handles_mask=True, a list of lists of booleans and return the model's predictions.

        model_handles_mask : If true it means the model function passed takes the mask (list of booleans) as an input. Default is False.

        """
        self.model = model
        self.model_handles_mask = model_handles_mask

    def __call__(
        self,
        input: list[str] | torch.Tensor,
        group_assignments: list[int],
        mask_value: str | list[str] | torch.Tensor,
        merge_masks=False,
        partition_tree=None,
        n_allowed_samples=256,
        track_execution_data=False,
    ):
        """Uses the KernelExplainer from SHAP to explain the model's predictions on the input groups.

        Parameters
        ----------
        input : The input to the model in the form of a list of strings or token_ids (as pytorch tensor).

        group_assignments : A list of integers representing the group assignments of the input, where group_assignments[i] is the group of input[i].

        mask_value : The value (string or token) to use to mask the input when the group is removed.
        If provided with a list of strings, the input will be masked with the corresponding string.
        E.g. the i-th input will be masked with mask_value[i] (thus len(mask_value) should be equal to len(input)).

        merge_masks : Whether to merge consecutive masks into a single mask. Default is False.

        track_execution_data : Whether to track the time taken and number of samples generated during the computation. Default is False.

        Returns
        -------
        shap_values : The SHAP values for the input groups.
        If track_execution_data is True, it also returns:
        total_time : The time taken to compute the SHAP values.
        numbers_of_samples_generated : The number of samples generated during the computation. (<= n_allowed_samples+2)

        """
        self.input = input
        self.is_tokens = type(input) == torch.Tensor
        self.input_length = len(input)
        # fmt: off
        self.group_assignments = standardize_groups(group_assignments)
        if type(mask_value) != list:
             # Use a list in all cases to simplify the masking process
            mask_value = [mask_value] * self.input_length
        self.mask_value = mask_value
        self.merge_masks = merge_masks
        self.groups = set(self.group_assignments)
        self.n_groups = len(self.groups)
        self.track_execution_data = track_execution_data

        if track_execution_data:
            import time
            self.numbers_of_samples_generated = 0
            start = time.time()


        if partition_tree is not None:
            # Received a partition tree -> use PartitionExplainer on top of given groups
            masker = self.get_masker_for_partitionshap(partition_tree)
            sub_explainer = shap.PartitionExplainer(
                self.f, masker
            )
            # All that partition shap needs is the number of inputs and the partition tree
            # The actual input is produced by the masker.
            # Hence, we pass in a dummy input whose only purpose is to declare the number of inputs

            self.shap_values = sub_explainer(["dummy"]).values[0]
        else:
            # No partition tree -> use KernelExplainer on the groups
            empty_mask = pd.Series([False] * self.n_groups)
            full_mask = pd.Series([True] * self.n_groups)
            self.shap_values = shap.KernelExplainer(self.f, empty_mask).shap_values(
                full_mask, 
                nsamples=n_allowed_samples
            )
        if track_execution_data:
            end = time.time()
            total_time = end - start
            return self.shap_values, total_time, self.numbers_of_samples_generated

        return self.shap_values

    def explain(self, input, group_assignments, mask_value, partition_tree=None):
        return self.__call__(input, group_assignments, mask_value, partition_tree)

    def mask_to_input_string(self, mask):
        input = ""
        prev_was_masked = False
        for i in range(self.input_length):
            # If mask is False, then the input is replaced with the mask value for that input
            # Else the input is included as is
            # fmt: off
            if not mask[self.group_assignments[i]]:
                if not prev_was_masked or (not self.merge_masks):
                    # Place the mask value if 1. not merging masks or 2. merging masks but the previous input was not masked
                    input += self.mask_value[i]
                prev_was_masked = True
            else:
                input += self.input[i]
                prev_was_masked = False

        return input

    def mask_to_input_tokens(self, mask):
        input = []
        prev_was_masked = False
        for i in range(self.input_length):
            # If mask is False, then the input is replaced with the mask value for that input
            # Else the input is included as is
            # fmt: off
            if not mask[self.group_assignments[i]]:
                if not prev_was_masked or (not self.merge_masks):
                    # Place the mask value if 1. not merging masks or 2. merging masks but the previous input was not masked
                    if self.mask_value[i] is not None: # Use mask value None to drop tokens completely
                        input.append(self.mask_value[i])
                prev_was_masked = True
            else:
                input.append(self.input[i])
                prev_was_masked = False
        if len(input) == 1:
            return input[0].unsqueeze(0)
        return torch.stack(input)

    def get_masker_for_partitionshap(self, partition_tree):
        """Get the masker for the PartitionSHAP explainer."""

        def mask_to_input_wrapper(mask):
            input = self.mask_to_input(mask)
            return [input]

        return self.GroupMasker(self.n_groups, mask_to_input_wrapper, partition_tree)

    def f(self, x):
        if self.track_execution_data:
            self.numbers_of_samples_generated += len(x)
        if self.model_handles_mask:
            model_responses = self.model(x)
        elif self.is_tokens:
            input_tokens = [self.mask_to_input_tokens(mask) for mask in x]
            model_responses = self.model(input_tokens)
        else:
            input_strings = [self.mask_to_input_string(mask) for mask in x]
            model_responses = self.model(input_strings)
        return model_responses

    def assemble_goups(self):
        """Have the atomic units of the input assemble into their respective groups."""
        assembled_groups = [""] * self.n_groups
        for i in range(len(self.input)):
            if assembled_groups[self.group_assignments[i]] == "":
                # Handle fencepost problem and add name of group to the string to distinguish them
                # in case the content is the same
                assembled_groups[self.group_assignments[i]] = (
                    f"C{self.group_assignments[i]}: " + self.input[i]
                )
            else:
                assembled_groups[self.group_assignments[i]] += self.input[i]
        return assembled_groups

    def print_shap_values(self):
        if self.shap_values is None:
            raise ValueError("SHAP values are not computed yet.")
            # TODO: Should it just go ahead and compute the SHAP values here if not done yet?
        else:
            assembled_groups = self.assemble_goups()
            group_to_val_pos = dict(zip(assembled_groups, self.shap_values))
            print(f"Shap values: {group_to_val_pos}")

    class GroupMasker(shap.maskers.Masker):
        # The signatures of the methods here are based on the PartitionExplainer's Masker

        def __init__(self, n_groups, mask_fn, partition_tree):
            self.n_groups = n_groups
            self.mask_fn = mask_fn
            self.partition_tree = partition_tree

        def __call__(self, mask, x):
            return [mask]

        def shape(self, x):
            return (1, self.n_groups)

        def mask_shapes(self, s):
            return [((self.n_groups),)]

        def feature_names(self, s):
            """The names of the features for each mask position for the given input string."""
            return [[f"Group {i}" for i in range(self.n_groups)]]

        def clustering(self, *args):
            return self.partition_tree
