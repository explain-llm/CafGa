import importlib.metadata
import pathlib

import anywidget
import traitlets

try:
    __version__ = importlib.metadata.version("demo")
except importlib.metadata.PackageNotFoundError:
    __version__ = "unknown"


class DisplayWidget(anywidget.AnyWidget):
    _esm = pathlib.Path(__file__).parent / "static" / "DisplayWidget.js"
    _css = pathlib.Path(__file__).parent / "static" / "DisplayWidget.css"
    value = traitlets.Int(0).tag(sync=True)
    inputSegments = traitlets.List(
        trait=traitlets.Unicode,
        default_value=["Init"],
    ).tag(sync=True)
    assignments = traitlets.List(trait=traitlets.Int, default_value=[0]).tag(sync=True)
    attributions = traitlets.List(trait=traitlets.Float, default_value=[0.5]).tag(sync=True)
    sampleName = traitlets.Unicode("Sample").tag(sync=True)


class EditWidget(anywidget.AnyWidget):
    _esm = pathlib.Path(__file__).parent / "static" / "EditWidget.js"
    _css = pathlib.Path(__file__).parent / "static" / "EditWidget.css"
    value = traitlets.Int(0).tag(sync=True)
    inputSegments = traitlets.List(
        trait=traitlets.Unicode,
        default_value=["Init"],
    ).tag(sync=True)
    assignments = traitlets.List(trait=traitlets.Int, default_value=[]).tag(sync=True)
    direction = traitlets.Unicode("deletion").tag(sync=True)
    sampleName = traitlets.Unicode("Sample").tag(sync=True)
