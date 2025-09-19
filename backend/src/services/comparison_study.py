from ..datatypes.study import ComparableExplanation
from ..persistence.samplePersister import load_explanation_array
def load_explanation_comparison_array(n_comparisons : int) -> list[list[ComparableExplanation]]:
    """
    Load a list of lists each containing a set of explanations to be compared.
    Parameters
    ----------
    n_comparisons : int
        The number of comparisons to load.

    Returns
    -------
    list[ComparableExplanation]: The explanation array for the user.
    """
    explanation_comparison_array = []
    for i in range(n_comparisons):
        explanation_comparison_array.append(load_explanation_array(task_id="SQUAD_0"))
    return explanation_comparison_array
