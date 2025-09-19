import pickle

class AssignedInput: 
    
    def __init__(
        self,
        input_segments: list[str],
        group_assignments: list[int],
        direction = None,
        sample_name = None,
    ):
        self.input_segments = input_segments
        self.group_assignments = group_assignments
        self.direction = direction
        self.sample_name = sample_name

    def __str__(self):
        return f"Sample: {self.sample_name}\nWith input Segments: {self.input_segments}\nAssigned as: {self.group_assignments}\nTo be evaluated with: {self.direction}"
    def save(self, path: str):
        """Save the AssignedInput object to a file."""
        with open(path, "w") as f:
            pickle.dump(self, f)

    def load(path: str):
        """Load the AssignedInput object from a file."""
        with open(path, "r") as f:
            return pickle.load(f)

class ExplainedInput():

    def __init__(
        self,
        input_segments: list[str],
        template: str,
        group_assignments: list[int],
        attributions: list[list[float]],
        mask_value: str | list[str],
        merge_masks=False,
    ):
        self.input_segments = input_segments
        self.template = template
        self.group_assignments = group_assignments
        self.attributions = attributions
        self.mask_value = mask_value
        self.merge_masks = merge_masks

    def get_attributions(self):
        """A simple getter method that cleans up the case when the model output is one-dimensional."""
        if len(self.attributions) == 1:
            return self.attributions[0]
        else:
            return self.attributions

    def save(self, path: str):
        """Save the ExplainedInput object to a file."""
        with open(path, "w") as f:
            pickle.dump(self, f)

    def load(path: str):
        """Load the ExplainedInput object from a file."""
        with open(path, "r") as f:
            return pickle.load(f)


class EvaluatedExplanation(ExplainedInput):

    def __init__(
        self,
        input_segments: list[str],
        template: str,
        group_assignments: list[int],
        attributions: list[list[float]],
        mask_value: str | list[str],
        merge_masks: bool,
        direction: str,
        is_descending: bool,
        step_size: int,
        differences: list[list[float]],
    ):
        super().__init__(
            input_segments, template, group_assignments, attributions, mask_value, merge_masks
        )
        self.direction = direction
        self.is_descending = is_descending
        self.step_size = step_size
        self.differences = differences

    def save(self, path: str):
        """Save the EvaluatedExplanation object to a file."""
        with open(path, "w") as f:
            pickle.dump(self, f)

    def load(path: str):
        """Load the EvaluatedExplanation object from a file."""
        with open(path, "r") as f:
            return pickle.load(f)

