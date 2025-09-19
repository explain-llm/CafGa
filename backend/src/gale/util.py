import numpy as np


def standardize_groups(group_assignments: list[int]) -> list[int]:
    """Standardize the groups assignments to be 0-indexed and contiguous."""
    groups = set(group_assignments)
    n_groups = len(groups)
    groups_dict = dict(zip(groups, range(n_groups)))
    return [groups_dict[c] for c in group_assignments]


def l1(a: float, b: float) -> float:
    return np.abs(a - b)


def l2(a: float, b: float) -> float:
    diff = a - b
    return np.sqrt(diff * diff)
