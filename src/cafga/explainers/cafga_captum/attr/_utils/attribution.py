#!/usr/bin/env python3

# pyre-strict
from typing import Callable, cast, Generic, List, Optional, Tuple, Type, Union

import torch
import torch.nn.functional as F
from cafga.explainers.cafga_captum._utils.common import (
    _format_additional_forward_args,
    _format_tensor_into_tuples,
    _run_forward,
    _validate_target,
)
from cafga.explainers.cafga_captum._utils.typing import ModuleOrModuleList, TargetType
from cafga.explainers.cafga_captum.attr._utils.common import (
    _format_input_baseline,
    _sum_rows,
    _tensorize_baseline,
    _validate_input,
)
from cafga.explainers.cafga_captum.log import log_usage
from torch import Tensor
from torch.nn import Module


# pyre-fixme[13]: Attribute `attribute` is never initialized.
# pyre-fixme[13]: Attribute `compute_convergence_delta` is never initialized.
class Attribution:
    r"""
    All attribution algorithms extend this class. It enforces its child classes
    to extend and override core `attribute` method.
    """

    # pyre-fixme[24]: Generic type `Callable` expects 2 type parameters.
    def __init__(self, forward_func: Callable) -> None:
        r"""
        Args:
            forward_func (Callable or torch.nn.Module): This can either be an instance
                        of pytorch model or any modification of model's forward
                        function.
        """
        self.forward_func = forward_func

    # pyre-fixme[24]: Generic type `Callable` expects 2 type parameters.
    # pyre-fixme[13]: Attribute `attribute` is never initialized.
    attribute: Callable
    r"""
    This method computes and returns the attribution values for each input tensor.
    Deriving classes are responsible for implementing its logic accordingly.

    Specific attribution algorithms that extend this class take relevant
    arguments.

    Args:

        inputs (Tensor or tuple[Tensor, ...]): Input for which attribution
                    is computed. It can be provided as a single tensor or
                    a tuple of multiple tensors. If multiple input tensors
                    are provided, the batch sizes must be aligned across all
                    tensors.


    Returns:

        *Tensor* or *tuple[Tensor, ...]* of **attributions**:
        - **attributions** (*Tensor* or *tuple[Tensor, ...]*):
                    Attribution values for each
                    input tensor. The `attributions` have the same shape and
                    dimensionality as the inputs.
                    If a single tensor is provided as inputs, a single tensor
                    is returned. If a tuple is provided for inputs, a tuple of
                    corresponding sized tensors is returned.

    """

    # pyre-fixme[24] Generic type `Callable` expects 2 type parameters.
    # pyre-fixme[13]: Attribute `attribute_future` is never initialized.
    attribute_future: Callable

    r"""
    This method computes and returns a Future of attribution values for each input
    tensor. Deriving classes are responsible for implementing its logic accordingly.

    Specific attribution algorithms that extend this class take relevant
    arguments.

    Args:

        inputs (Tensor or tuple[Tensor, ...]): Input for which attribution
                    is computed. It can be provided as a single tensor or
                    a tuple of multiple tensors. If multiple input tensors
                    are provided, the batch sizes must be aligned across all
                    tensors.


    Returns:

        *Future[Tensor]* or *Future[tuple[Tensor, ...]]* of **attributions**:
        - **attributions** (*Future[Tensor]* or *Future[tuple[Tensor, ...]]*):
                    Future of attribution values for each input tensor.
                    The results should be the same as the attribute
                    method, except that the results are returned as a Future.
                    If a single tensor is provided as inputs, a single Future tensor
                    is returned. If a tuple is provided for inputs, a Future of a
                    tuple of corresponding sized tensors is returned.
    """

    @property
    def multiplies_by_inputs(self) -> bool:
        return False

    def has_convergence_delta(self) -> bool:
        r"""
        This method informs the user whether the attribution algorithm provides
        a convergence delta (aka an approximation error) or not. Convergence
        delta may serve as a proxy of correctness of attribution algorithm's
        approximation. If deriving attribution class provides a
        `compute_convergence_delta` method, it should
        override both `compute_convergence_delta` and `has_convergence_delta` methods.

        Returns:
            bool:
            Returns whether the attribution algorithm
            provides a convergence delta (aka approximation error) or not.

        """
        return False

    # pyre-fixme[24]: Generic type `Callable` expects 2 type parameters.
    # pyre-fixme[13]: Attribute `compute_convergence_delta` is never initialized.
    compute_convergence_delta: Callable
    r"""
    The attribution algorithms which derive `Attribution` class and provide
    convergence delta (aka approximation error) should implement this method.
    Convergence delta can be computed based on certain properties of the
    attribution alogrithms.

    Args:

            attributions (Tensor or tuple[Tensor, ...]): Attribution scores that
                        are precomputed by an attribution algorithm.
                        Attributions can be provided in form of a single tensor
                        or a tuple of those. It is assumed that attribution
                        tensor's dimension 0 corresponds to the number of
                        examples, and if multiple input tensors are provided,
                        the examples must be aligned appropriately.
            *args (Any, optional): Additonal arguments that are used by the
                        sub-classes depending on the specific implementation
                        of `compute_convergence_delta`.

    Returns:

            *Tensor* of **deltas**:
            - **deltas** (*Tensor*):
                Depending on specific implementaion of
                sub-classes, convergence delta can be returned per
                sample in form of a tensor or it can be aggregated
                across multuple samples and returned in form of a
                single floating point tensor.
    """

    @classmethod
    def get_name(cls: Type["Attribution"]) -> str:
        r"""
        Create readable class name by inserting a space before any capital
        characters besides the very first.

        Returns:
            str: a readable class name
        Example:
            for a class called IntegratedGradients, we return the string
            'Integrated Gradients'
        """
        return "".join(
            [
                char if char.islower() or idx == 0 else " " + char
                for idx, char in enumerate(cls.__name__)
            ]
        )


class PerturbationAttribution(Attribution):
    r"""
    All perturbation based attribution algorithms extend this class. It requires a
    forward function, which most commonly is the forward function of the model
    that we want to interpret or the model itself.
    """

    # pyre-fixme[24]: Generic type `Callable` expects 2 type parameters.
    def __init__(self, forward_func: Callable) -> None:
        r"""
        Args:

            forward_func (Callable or torch.nn.Module): This can either be an instance
                        of pytorch model or any modification of model's forward
                        function.
        """
        Attribution.__init__(self, forward_func)

    @property
    def multiplies_by_inputs(self) -> bool:
        return True


# mypy false positive "Free type variable expected in Generic[...]" but
# ModuleOrModuleList is a TypeVar
class InternalAttribution(Attribution, Generic[ModuleOrModuleList]):  # type: ignore
    r"""
    Shared base class for LayerAttrubution and NeuronAttribution,
    attribution types that require a model and a particular layer.
    """

    layer: ModuleOrModuleList

    def __init__(
        self,
        # pyre-fixme[24]: Generic type `Callable` expects 2 type parameters.
        forward_func: Callable,
        layer: ModuleOrModuleList,
        device_ids: Union[None, List[int]] = None,
    ) -> None:
        r"""
        Args:

            forward_func (Callable or torch.nn.Module): This can either be an instance
                        of pytorch model or any modification of model's forward
                        function.
            layer (torch.nn.Module): Layer for which output attributions are computed.
                        Output size of attribute matches that of layer output.
            device_ids (list[int]): Device ID list, necessary only if forward_func
                        applies a DataParallel model, which allows reconstruction of
                        intermediate outputs from batched results across devices.
                        If forward_func is given as the DataParallel model itself,
                        then it is not necessary to provide this argument.
        """
        Attribution.__init__(self, forward_func)
        self.layer = layer
        self.device_ids = device_ids


# pyre-fixme[24]: Generic type `InternalAttribution` expects 1 type parameter.
class LayerAttribution(InternalAttribution):
    r"""
    Layer attribution provides attribution values for the given layer, quantifying
    the importance of each neuron within the given layer's output. The output
    attribution of calling attribute on a LayerAttribution object always matches
    the size of the layer output.
    """

    def __init__(
        self,
        # pyre-fixme[24]: Generic type `Callable` expects 2 type parameters.
        forward_func: Callable,
        layer: ModuleOrModuleList,
        device_ids: Union[None, List[int]] = None,
    ) -> None:
        r"""
        Args:

            forward_func (Callable or torch.nn.Module): This can either be an instance
                        of pytorch model or any modification of model's forward
                        function.
            layer (torch.nn.Module): Layer for which output attributions are computed.
                        Output size of attribute matches that of layer output.
            device_ids (list[int]): Device ID list, necessary only if forward_func
                        applies a DataParallel model, which allows reconstruction of
                        intermediate outputs from batched results across devices.
                        If forward_func is given as the DataParallel model itself,
                        then it is not necessary to provide this argument.
        """
        InternalAttribution.__init__(self, forward_func, layer, device_ids)

    @staticmethod
    def interpolate(
        layer_attribution: Tensor,
        interpolate_dims: Union[int, Tuple[int, ...]],
        interpolate_mode: str = "nearest",
    ) -> Tensor:
        r"""
        Interpolates given 3D, 4D or 5D layer attribution to given dimensions.
        This is often utilized to upsample the attribution of a convolutional layer
        to the size of an input, which allows visualizing in the input space.

        Args:

            layer_attribution (Tensor): Tensor of given layer attributions.
            interpolate_dims (int or tuple): Upsampled dimensions. The
                        number of elements must be the number of dimensions
                        of layer_attribution - 2, since the first dimension
                        corresponds to number of examples and the second is
                        assumed to correspond to the number of channels.
            interpolate_mode (str): Method for interpolation, which
                        must be a valid input interpolation mode for
                        torch.nn.functional. These methods are
                        "nearest", "area", "linear" (3D-only), "bilinear"
                        (4D-only), "bicubic" (4D-only), "trilinear" (5D-only)
                        based on the number of dimensions of the given layer
                        attribution.

        Returns:
            *Tensor* of upsampled **attributions**:
            - **attributions** (*Tensor*):
                Upsampled layer attributions with first 2 dimensions matching
                slayer_attribution and remaining dimensions given by
                interpolate_dims.
        """
        return F.interpolate(layer_attribution, interpolate_dims, mode=interpolate_mode)


# pyre-fixme[13]: Attribute `attribute` is never initialized.
# pyre-fixme[24]: Generic type `InternalAttribution` expects 1 type parameter.
class NeuronAttribution(InternalAttribution):
    r"""
    Neuron attribution provides input attribution for a given neuron, quantifying
    the importance of each input feature in the activation of a particular neuron.
    Calling attribute on a NeuronAttribution object requires also providing
    the index of the neuron in the output of the given layer for which attributions
    are required.
    The output attribution of calling attribute on a NeuronAttribution object
    always matches the size of the input.
    """

    def __init__(
        self,
        # pyre-fixme[24]: Generic type `Callable` expects 2 type parameters.
        forward_func: Callable,
        layer: Module,
        device_ids: Union[None, List[int]] = None,
    ) -> None:
        r"""
        Args:

            forward_func (Callable or torch.nn.Module): This can either be an instance
                        of pytorch model or any modification of model's forward
                        function.
            layer (torch.nn.Module): Layer for which output attributions are computed.
                        Output size of attribute matches that of layer output.
            device_ids (list[int]): Device ID list, necessary only if forward_func
                        applies a DataParallel model, which allows reconstruction of
                        intermediate outputs from batched results across devices.
                        If forward_func is given as the DataParallel model itself,
                        then it is not necessary to provide this argument.
        """
        InternalAttribution.__init__(self, forward_func, layer, device_ids)

    # pyre-fixme[24]: Generic type `Callable` expects 2 type parameters.
    # pyre-fixme[13]: Attribute `attribute` is never initialized.
    attribute: Callable
    r"""
    This method computes and returns the neuron attribution values for each
    input tensor. Deriving classes are responsible for implementing
    its logic accordingly.

    Specific attribution algorithms that extend this class take relevant
    arguments.

    Args:

            inputs:     A single high dimensional input tensor or a tuple of them.
            neuron_selector (int or tuple): Tuple providing index of neuron in output
                    of given layer for which attribution is desired. Length of
                    this tuple must be one less than the number of
                    dimensions in the output of the given layer (since
                    dimension 0 corresponds to number of examples).

    Returns:

            *Tensor* or *tuple[Tensor, ...]* of **attributions**:
            - **attributions** (*Tensor* or *tuple[Tensor, ...]*):
                    Attribution values for
                    each input vector. The `attributions` have the
                    dimensionality of inputs.
    """
