from __future__ import annotations
import pydantic
import enum


class Node(pydantic.BaseModel):
    nodeId: str
    parent: parentNode
    children: childNodes
    textIds: list[int]


parentNode = Node | None
childNodes = list[Node]


class Tree(pydantic.BaseModel):
    root: Node
    # Array of nodes where the i-th entry is the node that points to the i-th text segment.
    # In other words the text segments are virtual leaf nodes that are not stored in the tree.
    leafBackPointers: list[Node]
