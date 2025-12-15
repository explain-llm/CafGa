from torch import nn, Tensor
import numpy as np
from pandas import Series
from cafga.util import standardize_groups, evaluate_outcome


# Token ids used to simulate masks for captum explainers
# TODO: Figure out what captum uses as the absence token ids
presence_token_id = 1
absence_token_id = 0

class MaskedModel(nn.Module):
    """
    A wrapper that handles the masks from the explainer as input and gets the related output from the underlying model.
    """

    def __init__(self, model, explainer_is_captum=False):
        """
        Initializes the MaskedModel with the given underlying model.
        Parameters:
        model: A callable that takes a list of strings as input and returns a list of outputs. 
        The model is expected to handle multiple inputs at once, to allow for parallelization in the underlying model.
        """
        super().__init__()
        self.model = model
        self.explainer_is_captum = explainer_is_captum
        self.input_length = -1 # to be set later
        self.output_numpy = False


    def init_scalarizer(self, scalarizer):
        if type(scalarizer) == list:
            # the model returns a string and the scalarizer is from the predefined list
            def predefined_scalarizer(responses):
                results = []
                for operator, target in scalarizer:
                    results.append(evaluate_outcome(responses, operator, target))
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
    def define_task(
            self,
            input_segments: list[str],
            group_assignments: list[int],
            template: str = None,
            scalarizer=None, # if this is a string convert to predefined scalarizer else use it as a function
            mask_value: str | list[str] = "",
            merge_masks=False,
                    
        ):
        self.input_segments = input_segments
        self.input_length = len(input_segments)
        self.group_assignments = standardize_groups(group_assignments)
        self.n_groups = len(set(self.group_assignments))
        self.template = template
        self.need_to_set_template = False
        if template is not None:
            if hasattr(self.model, "set_template"):
                self.model.set_template(template)
            else:
                if not "{input}" in template:
                    raise ValueError("A template was provided without the {input} placeholder.\nTo use the template in a custom fashion please implement the set_template method in your model class. Otherwise CafGa will just use the template in a generic fashion by replacing {input} with the perturbed input.")
                self.need_to_set_template = True
        if not isinstance(mask_value, list):
            # Always use list to keep it consistent
            mask_value = [mask_value] * self.input_length
        self.mask_value = mask_value
        self.merge_masks = merge_masks
        self.init_scalarizer(scalarizer)

    def get_full_mask(self):
        if not self.explainer_is_captum:
            return Series([True] * self.n_groups)
        else:
            return Tensor([[presence_token_id] * self.n_groups])
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
                input += self.input_segments[i]
                prev_was_masked = False
        if self.need_to_set_template:
            input = self.template.replace("{input}", input)

        return input
    
    def input_to_scalarized_output(self, input_list):
            model_predictions = self.model(input_list)
            if self.uses_scalarizer:
                scalarized_predictions = np.zeros((len(input_list), self.scalarizer_output_dim))
                for i in range(len(input_list)):
                    scalarized_predictions[i] = self.scalarizer(model_predictions[i])
                predictions = scalarized_predictions
            else:
                predictions = model_predictions
            if self.explainer_is_captum:
                # If the explainer is from captum we need to satisfy two conditions:
                # 1. The output must be a Tensor
                # 2. The output must be formatted as with two predictions (e.g. [p_c0, 1 - p_c0]) for binary classification tasks
                predictions = np.array(predictions)
                if len(predictions.shape) == 1:
                    # Single output per input, need to convert to two outputs
                    predictions = np.stack([predictions, 1 - predictions], axis=1)
                predictions = Tensor(predictions)
            if self.output_numpy and isinstance(predictions, Tensor):
                predictions = predictions.detach().cpu().numpy()
            return predictions
    def convert_masks(self, mask_list):
        if (isinstance(mask_list, list) or isinstance(mask_list, np.ndarray)):
            # The mask list is already in the correct format
            return mask_list
        elif isinstance(mask_list, Tensor):
            # The mask list is a Tensor of token_ids generated by the captum explainer
            converted_masks = []
            for i in range(mask_list.shape[0]):
                token_ids = mask_list[i].tolist()
                binary_mask = [token_id == presence_token_id for token_id in token_ids]
                converted_masks.append(binary_mask)
            return converted_masks
        else:
            raise ValueError(f"Unknown mask format: {type(mask_list)}")

    def masks_to_output(self, mask_list):
        mask_list = self.convert_masks(mask_list)
        input_list = [self.mask_to_input(mask) for mask in mask_list]
        return self.input_to_scalarized_output(input_list)
    
    def get_empty_output(self):
        empty_input = ""
        if self.input_length > 0:
            if self.merge_masks:
                empty_input = self.mask_value[0]
            else:
                for i in range(self.input_length):
                    empty_input += self.mask_value[i]

            if self.need_to_set_template:
                empty_input = self.template.replace("{input}", empty_input)

        return self.input_to_scalarized_output([empty_input])

    def get_original_prediction(self):
        input = "".join(self.input_segments)
        return self.input_to_scalarized_output([input])[0]
