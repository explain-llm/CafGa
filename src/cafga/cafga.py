import enum
import numpy as np
import pandas as pd
from shap import KernelExplainer #, PartitionExplainer
# from shap.maskers import Masker
import matplotlib.pyplot as plt
import os
from os.path import join as pjoin

from . import util
from .models import load_model
from .containers import AssignedInput, ExplainedInput, EvaluatedExplanation


class Operator(enum.Enum):
    START_WITH = "START_WITH"
    END_WITH = "END_WITH"
    EQUAL = "EQUAL"
    CONTAIN = "CONTAIN"
    # The following operators are not supported in this version
    # SEMANTIC_EQUAL = "SEMANTIC_EQUAL"
    # ENTAIL = "ENTAIL"
    # CONTRADICT = "CONTRADICT"


class CAFGA:
    def __init__(self, model, model_params=None, explainer="KernelSHAP", explainer_params=None):
        """
        Create a CAFGA object.

        params
        ------
        model: str | callable
            The model whose predictions are to be explained. The model should be a callable that takes a list of strings as input and either returns list containing an output for each input. 
            The output can be of two kinds:
            1. The output can be a list of floats each representing a separate prediction on the same input (e.g. sentiment classifier).
            2. As an intermediate step the output may also be a list of string responses from the model (e.g. generative model)

            In case 2. the output still needs to be post processed into a list of float predictions. This can be done by providing a scalarizer to the explain function.
            The explain function will generate attributions for each float prediction separately. 
            To use a predefined model you can pass a string with the name of the model. The available option is "chatgpt".

        model_params: dict
            Parameters for the predefined model. (Not used if a custom model is provided)
        explainer: str
            The explainer method to be used. Currently only KernelSHAP is supported.
        """
        if type(model) == str:
            if model_params is None:
                model_params = {}
            self.model = load_model(model, **model_params)
        else:
            self.model = model

    def get_original_predicitons(self, input_segments : list[str]):
        input = "".join(input_segments)
        return self.f([input])

    def mask_to_input(self, mask):
        input = ""
        prev_was_masked = False
        for i in range(self.input_length):
            # If mask is False, then the input is replaced with the mask value for that input
            # Else the input is included as is
            if not mask[self.group_assignments[i]]:
                if not prev_was_masked or (not self.merge_masks):
                    # Place the mask value if 1. not merging masks or 2. merging masks but the previous input was not masked
                    input += self.mask_value[i]
                prev_was_masked = True
            else:
                input += self.input[i]
                prev_was_masked = False

        return input

    def mask_to_output(self, mask_list):
        input_list = [self.mask_to_input(mask) for mask in mask_list]
        return self.f(input_list)

    def init_scalarizer(self, scalarizer):
        if type(scalarizer) == list:
            # the model returns a string and the scalarizer is from the predefined list
            def predefined_scalarizer(responses):
                results = []
                for operator, target in scalarizer:
                    results.append(util.evaluate_outcome(responses, operator, target))
                return results

            self.scalarizer = predefined_scalarizer
        else:
            self.scalarizer = scalarizer
        self.uses_scalarizer = self.scalarizer is not None
        if self.uses_scalarizer:
            dummy_output = self.scalarizer([""])
        else:
            dummy_output = self.model([""])[0]
        if hasattr(dummy_output, "__len__") :
            self.scalarizer_output_dim = len(dummy_output)
        else:
            self.scalarizer_output_dim = 1

    def _explain(
        self,
        input: list[str],
        group_assignments: list[int],
        mask_value: str | list[str],
        merge_masks=False,
        partition_tree=None,
        n_allowed_samples=512,
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
        self.input_length = len(input)
        self.group_assignments = util.standardize_groups(group_assignments)
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
            raise NotImplementedError("Using the partition tree is not supported in this version.")
            # Received a partition tree -> use PartitionExplainer on top of given groups
            masker = self.get_masker_for_partitionshap(partition_tree)
            sub_explainer = PartitionExplainer(
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
            self.shap_values = KernelExplainer(self.mask_to_output, empty_mask).shap_values(
                full_mask, 
                nsamples=n_allowed_samples
            )
        if track_execution_data:
            end = time.time()
            total_time = end - start
            return self.shap_values, total_time, self.numbers_of_samples_generated

        return self.shap_values

    def explain(
        self,
        input: str = None,
        assignment_method: str = None,
        segmented_input : list[str] = None,
        custom_assignments : list[int] = None,
        mask_value : str = "",
        merge_masks : bool = True,
        scalarizer = None,
        template : str = None,
        n_allowed_samples = 256,
    ):
        """
        Explain the model's prediction on the given input under the group assignment method proivded.

        params
        ------
        input: str 
            The unsegmented input to the model. If segmented_input is provided, this is ignored. The input will be segmented according to the assignment_method provided.
        assignment_method: str 
            The name of a predefined assignment method. The options are "word", "sentence" and "paragraph". ("syntax-tree" is not available in this version).
        segmented_input: list[str]
            The segments of the input to be explained. Custom assignments must be provided alongside this. This can be used to run the explanation on a custom assignment method. 
        custom_assignments: list[int]
            The custom group assignments for the segmented_input. This must be provided alongside segmented_input. The assignments should be formatted such that custom_assignments[i] is the group that segmented_input[i] belongs to.
        mask_value: str
            The value to use to mask the input when the group is removed.
        merge_masks: bool
            Whether to merge consecutive masks into a single mask.
        scalarizer:
            The scalarizer to use to convert the model's output (string) to a list of floats (each representing a prediction derived from the model's reponse). If None, it is assumed that the model provided at initialization returns a float as output.
            To use a one of the provided scalarizers pass a list of tuples [(operator, target)] where operator is one of the predefined operators and target is the target value to be used in the operator.
        template: str
            If you have a template that the input should be pasted into before being passed to the model, provide it here.
            This assumes that the model you provided has a set_template method that takes a string as input.
        n_allowed_samples: int
            The number of samples to generate for the KernelExplainer. Default is 256.

        Returns
        -------
        ExplainedInput: An object containing the input, the group assignments, the attributions, the mask_value, and the merge_masks value.
        Note that attributions is a list of lists of the shape: [n_scalar_outputs, n_groups] where n_scalar_outputs is the number of scalar outputs of the scalarizer/ the original model.

        """
        if segmented_input is None or custom_assignments is None:
            # parse the input
            match assignment_method:
                case "word":
                    input_segments = util.word_tokenize(input)
                    assignments = range(len(input_segments))
                case "sentence":
                    input_segments = util.sentence_tokenize(input)
                    assignments = range(len(input_segments))
                case "paragraph":
                    input_segments = util.paragraph_tokenize(input)
                    assignments = range(len(input_segments))
                case "syntax-tree":
                    input_segments, assignments = util.syntax_tokenize(input)
        else:
            input_segments = segmented_input
            assignments = custom_assignments

        self.init_scalarizer(scalarizer)

        def f(input_list):
            model_predictions = self.model(input_list)
            if self.uses_scalarizer:
                scalarized_predictions = np.zeros((len(input_list), self.scalarizer_output_dim))
                for i in range(len(input_list)):
                    scalarized_predictions[i] = self.scalarizer(model_predictions[i])
                return scalarized_predictions
            else:
                return model_predictions

        self.f = f
        if template is not None:
            try:
                self.model.set_template(template)
            except Exception as e:
                print("Encountered the following error when trying to set the template:")
                print(e)
                print("If you would like to use a template, your model should have a function: \"set_template\"")
        explanation = self._explain(input_segments, assignments, mask_value, merge_masks, n_allowed_samples=n_allowed_samples)
        if self.scalarizer_output_dim > 1:
            # Transpose from (n_groups, n_outputs) to (n_outputs, n_groups)
            explanation = [[attribution[d] for attribution in explanation] for d in range(self.scalarizer_output_dim)]
        else:
            # Only have one output for which we generate attributions
            explanation = [explanation] 
        explained_input = ExplainedInput(
            input_segments, template, assignments, explanation, mask_value, merge_masks
        )
        self.most_recent_explanation = explained_input
        return explained_input

    def compute_difference_original_to_perturbed(
        self, original_prediction, input_perturbations, scalarizer_index, difference_metric=None
    ):
        """Compute the difference of the explanation on the perturbed inputs as the difference between the original prediction and the perturbed prediction."""
        if difference_metric is None:
            difference_metric = util.l1

        differences = np.zeros(len(input_perturbations))
        perturbed_predictions = self.f(input_perturbations)
        for j, perturbed_prediction in enumerate(perturbed_predictions):
            difference = difference_metric(
                original_prediction[0][scalarizer_index], perturbed_prediction[scalarizer_index]
            )
            differences[j] = difference
        return differences

    def evaluate(
        self,
        explained_input: ExplainedInput,
        scalarizer,
        direction : str,
        step_size = 1,
        cut_off = 1.0,
        is_descedning=True,
        flip_signs=False,
    ):
        """
        Evaluate the explanation provided by the explain function. 
        As the two forms of evaluation are deletion and insertion, evaluating means calculating the differences between the original prediction and the prediction on the perturbed inputs.

        Params
        ------
        explained_input: ExplainedInput 
            The explanation to evaluate. Recevied from running the explain function.
        scalarizer:
            The same scalarizer used in the explain function. 
            (Not stored in the ExplainedInput object because the scalarizer may be a function and not serializable)
        direction: str
            The direction of perturbation. All ones to all zeroes (deletion) or all zeroes to all ones (insertion).

        Returns
        -------
        evaluated_explanation: EvaluatedExplanation
          An object containing the explained input, the parameters of the evaluation and the resulting differences.
        """
        self.init_scalarizer(scalarizer)
        def f(input_list):
            model_predictions = self.model(input_list)
            if self.uses_scalarizer:
                scalarized_predictions = np.zeros((len(input_list), self.scalarizer_output_dim))
                for i in range(len(input_list)):
                    scalarized_predictions[i] = self.scalarizer(model_predictions[i])
                return scalarized_predictions
            else:
                return model_predictions

        if explained_input.template is not None:
            self.model.set_template(explained_input.template)
        self.f = f
        input_segments = explained_input.input_segments
        group_assignments = util.standardize_groups(explained_input.group_assignments)
        mask_value = explained_input.mask_value
        merge_masks = explained_input.merge_masks

        # perturbed_inputs = None
        original_prediction = self.get_original_predicitons(input_segments)
        differences_by_scalarizer = []
        # For each scalarizer we may have a different ranking so need to create the perturbations for each scalarizer separately
        for scalarizer_index, attributions in enumerate(explained_input.attributions):
            if flip_signs:
                if (
                    original_prediction < 0.5
                ):  # If predict negative class, flip the signs of the attributions
                    attributions = -attributions
            rankings = util.get_group_ranking(attributions, is_descedning)
            input_perturbations = util.generate_perturbations(
                input_segments,
                group_assignments,
                rankings,
                mask_value,
                merge_masks,
                util.BitVectorSamplingType(direction.lower()),
                step_size,
                cut_off,
            )
            differences = self.compute_difference_original_to_perturbed(
                original_prediction, input_perturbations, scalarizer_index
            )
            differences_by_scalarizer.append(differences)

        return EvaluatedExplanation(
            input_segments,
            explained_input.template,
            group_assignments,
            explained_input.attributions,
            mask_value,
            merge_masks,
            direction,
            is_descedning,
            step_size,
            differences_by_scalarizer,
        )

    def visualize_evaluation(
        self,
        evaluated_explanations: list[EvaluatedExplanation],
        scalarizer_index: int,
        bin_size : float = 0.0,
        output_dir : str = None,
        std_display : str = "area",
    ):
        """
        Plot the graph of the differences in prediction at each percentage of the features perturbed averaged over all samples.
        If bin_size is None then only explanation may be provided and it will be plotted directly without binning or interpolation.
        If bin_size == 0.0, the graph is plotted using interpolation.
        If bin_size > 0.0, the graph is plotted with equal width binning.

        Parameters
        ----------
        evaluated_explanations : list[EvaluatedExplanation]
            The evaluated explanations to plot.
        scalarizer_index : int
            The index of the scalarizer for which the differences are to be plotted.
        bin_size : float
            The size of the bin to use for binning the results. If 0.0, interpolation is used.
        output_dir : str
            The directory to save the graph to.
        std_display : str
            The way to display the standard deviation. Default is None. 
            Options are "area" and "bar".
        """
        # Collect all the values needed from the evaluated explanations
        n = len(evaluated_explanations)
        direction = evaluated_explanations[0].direction.lower()
        direction_enum = util.BitVectorSamplingType(direction)
        value_at_zero = (
                0.0 if direction_enum == util.BitVectorSamplingType.DELETION else 1.0
            )
        is_descending = evaluated_explanations[0].is_descending
        differences_list = []
        percentages_by_step_list = [] # The percentage of features perturbed at each step for each evaluation
        for i in range(n):
            if evaluated_explanations[i].direction.lower() != direction:
                raise ValueError(
                    "All evaluated explanations should have the same direction of perturbation."+
                    f" Got {direction} for first evaluation, but {evaluated_explanations[i].direction} at {i}-th evaluation."
                )
            if evaluated_explanations[i].is_descending != is_descending:
                raise ValueError(
                    "All evaluated explanations should have the same is_descending value."+
                    f" Got {is_descending} for first evaluation, but {evaluated_explanations[i].is_descending} at {i}-th evaluation."
                )
            attributions = evaluated_explanations[i].attributions[scalarizer_index]
            differences = evaluated_explanations[i].differences[scalarizer_index]
            ranking = util.get_group_ranking(
                attributions, is_descending
            )
            percentage = util.get_size_percentages(evaluated_explanations[i].group_assignments)
            monotonic_percentage = util.get_monotonic_size_by_ranking(ranking, percentage)
            # Recreate the size of the perturbation at each step
            n_differences = len(differences)
            percentages_by_step = np.zeros(n_differences + 1)
            # If we do deletion then 0% perturbed means it's the original input, so the difference should be 0.0 and vice versa for insertion

            differences = np.insert(
                differences, 0, value_at_zero
            )
            step_size = evaluated_explanations[i].step_size
            cur_index = 1
            for j in range(step_size, n_differences,step_size,):
                percentages_by_step[cur_index] = sum(monotonic_percentage[j-step_size:j])
                cur_index += 1
            percentages_by_step[cur_index] = 1.0
            differences_list.append(differences)
            percentages_by_step_list.append(percentages_by_step)

        n_items_in_bin = None
        if bin_size is None:
            if len(evaluated_explanations) > 1:
                raise ValueError(
                    "Cannot plot graph directly when multiple evaluations are provided."
                )
            x_axis = percentages_by_step_list[0]
            y_axis = differences_list[0]
            std = None
        elif bin_size == 0.0:
            x_axis, y_axis, std = util.collect_with_interpolation(differences_list, percentages_by_step_list)
        else:
            n_bins = int(1.0 / bin_size) + 1
            x_axis, y_axis, std, n_items_in_bin = util.collect_results_in_bins(
                differences_list, percentages_by_step_list, bin_size=bin_size, n_bins=n_bins
            )

        plt.figure(figsize=(10, 6))
        if bin_size == 0.0:
            marker = None
        else:
            marker = "o"
        plt.plot(x_axis, y_axis, marker=marker, linestyle="-")
        y_max = max(y_axis) + 0.05
        if std is not None:
            y_max += + max(std) 
        plt.ylim(ymin=0, ymax=y_max)
        plt.xlim(xmin=0, xmax=1.01)
        plt.xticks(x_axis)
        if std is not None and std_display is not None:
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
        direction_name = direction_enum.name.lower()
        pretty_direction = "deleted" if direction_enum == util.BitVectorSamplingType.DELETION else "inserted"
        plt.xlabel(f"Percentage of {pretty_direction} features")
        plt.ylabel("Difference in prediction")
        plt.title(f"Difference in prediciton at each percentage of {pretty_direction} features")
        plt.grid(True, which="both")
        if output_dir is not None:
            os.makedirs(output_dir, exist_ok=True)
            if bin_size == 0.0:
                graph_name = f"{direction_name}_graph_n{n}.png"
            else:
                graph_name = f"{direction_name}_graph_bins{bin_size}_n{n}.png"
            plt.savefig(
                pjoin(
                    output_dir,
                    graph_name,
                )
            )
        plt.show()

    def edit_assignments(self,input : str, parser : str):
        """
        Given and input and a parser the function returns and edit widget that can be used to edit the input.

        params
        ------
        input: str
            The input as a string that will into assignable input segments.
        parser: str
            The parser to use to parse the input. Options are "word", "sentence", "syntax-tree".
        """
        try:
            from .demo.src.demo import EditWidget
        except ImportError:
            raise ImportError("The demo module is required to run this function. It is currently not part of the PyPI release and needs to be downloaded from the repository instead.")
        match parser.lower():
            case "word":
                input_segments = input.split()
                for i in range(len(input_segments) - 1):
                    input_segments[i] = input_segments[i] + " "
            case "sentence":
                input_segments = input.split(". ")
            case "syntax-tree":
                input_segments, _ = util.get_syntax_parse(input)
        self.edit_widget = EditWidget(inputSegments = input_segments)
        return self.edit_widget

    def get_edited_input(self):
        """
        Get the input after it has been edited using the edit_assignments function.
        """
        if self.edit_widget is None:
            raise ValueError("No edit widget has been created. Please run the edit_assignments function first.")
        input_segments = self.edit_widget.inputSegments
        assignments = self.edit_widget.assignments
        sample_name = self.edit_widget.sampleName
        direction = self.edit_widget.direction
        return AssignedInput(input_segments, assignments, direction, sample_name)

    def display_explanation(self, input_segments, group_assignments, attributions, sample_name = "Unnamed Sample"):
        """
        Display the explanation of the model's prediction on the input.

        params
        ------
        input_segments: list[str]
            The input segments of the input.
        group_assignments: list[int]
            The group assignments of the input segments.
        attributions: list[float]
            The attributions of the input segments.
        """
        try:
            from .demo.src.demo import DisplayWidget
        except:
            raise ImportError("The demo module is required to run this function. It is currently not part of the PyPI release and needs to be downloaded from the repository instead.")
        self.display_widget = DisplayWidget(
            inputSegments=input_segments,
            assignments=group_assignments,
            attributions=list(attributions),
            sampleName=sample_name,
        )
        return self.display_widget

    def get_masker_for_partitionshap(self, partition_tree):
        """Get the masker for the PartitionSHAP explainer."""

        def mask_to_input_wrapper(mask):
            input = self.mask_to_input(mask)
            return [input]

        # return self.GroupMasker(self.n_groups, mask_to_input_wrapper, partition_tree)

    # class GroupMasker(Masker):
    #     # The signatures of the methods here are based on the PartitionExplainer's Masker

    #     def __init__(self, n_groups, mask_fn, partition_tree):
    #         self.n_groups = n_groups
    #         self.mask_fn = mask_fn
    #         self.partition_tree = partition_tree

    #     def __call__(self, mask, x):
    #         return [mask]

    #     def shape(self, x):
    #         return (1, self.n_groups)

    #     def mask_shapes(self, s):
    #         return [((self.n_groups),)]

    #     def feature_names(self, s):
    #         """The names of the features for each mask position for the given input string."""
    #         return [[f"Group {i}" for i in range(self.n_groups)]]

    #     def clustering(self, *args):
    #         return self.partition_tree
