#!/usr/bin/env python3

# pyre-strict

try:
    from cafga.explainers.cafga_captum.log.fb.internal_log import (
        disable_detailed_logging,
        log,
        log_usage,
        patch_methods,
        set_environment,
        TimedLog,
    )

    __all__ = [
        "log",
        "log_usage",
        "TimedLog",
        "set_environment",
        "disable_detailed_logging",
        "patch_methods",
    ]

except ImportError:
    # bug with mypy: https://github.com/python/mypy/issues/1153
    from cafga.explainers.cafga_captum.log.dummy_log import (  # type: ignore
        disable_detailed_logging,
        log,
        log_usage,
        patch_methods,
        set_environment,
        TimedLog,
    )
