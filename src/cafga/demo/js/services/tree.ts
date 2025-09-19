import { Tree, Node } from "../datatypes/tree";
function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
      (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    );
  }

export function initializeTree(numinputSegments:number): Tree {
    let root = {
        nodeId: uuidv4(),
        parent: null,
        children: [],
        textIds: Array.from({length: numinputSegments}, (_, i) => i)
    }
    return {
        root: root,
        leafBackPointers: Array.from({length: numinputSegments}, () => root),
    }
}
export function addNode(tree:Tree, parent: Node, textIds:number[]): Node {
    let newNode: Node = {
        nodeId: uuidv4(),
        parent: parent,
        children: [],
        textIds: textIds,
    };
    parent.children.push(newNode);
    parent.textIds = parent.textIds.filter(id => !textIds.includes(id));
    for (let i = 0; i < textIds.length; i++) {
        tree.leafBackPointers[textIds[i]] = newNode;
    }
    return newNode;
}
export function removeNode(node: Node): void {
    if (node.parent === null) {
        throw new Error("Cannot remove root node");
    }
    let index = node.parent.children.indexOf(node);
    node.parent.children.splice(index, 1);
    node.parent = null;
}
export function makeTreeSerializable(root: Node | undefined): void {
    // Break circular references for serialization.
    if (root === undefined) {
        return;
    }
    let stack = [root];
    while (stack.length > 0) {
        let node = stack.pop();
        if (node === undefined) {
            continue;
        }
        node.children.forEach(child => stack.push(child));
        node.parent = null;
    }
}
export function recreateTree(root: Node): Tree {
    // Recreate the circular references after deserialization.
    let leafBackPointers = new Array<Node>();
    let stack = [root];
    while (stack.length > 0) {
        let node = stack.pop();
        if (node === undefined) {
            continue;
        }
        for (let i = 0; i < node.textIds.length; i++) {
            leafBackPointers[node.textIds[i]] = node;
        }
        if (node.children.length > 0) {
            for (let i = 0; i < node.children.length; i++){
                node.children[i].parent = node
            }
            stack.push(...node.children);
        }
    }
    return {
        root: root,
        leafBackPointers: leafBackPointers,
    }

}

export function createEditTreeFromAssignments(assignments: number[]) {
    let tree = initializeTree(assignments.length);
    let groups = new Map<number, number[]>(); // key is group id, value is list of text segment ids
    for (let i = 0; i < assignments.length; i++) {
        let group = groups.get(assignments[i]);
        if (group === undefined) {
            groups.set(assignments[i], [i]);
        } else {
            group.push(i);
        }
    }
    for (let [key, value] of groups) {
        addNode(tree, tree.root, value);
    }
    return tree;
}

export function moveLeavesUp(tree: Tree, leafIndeces: number[]): void {
    // All leaf nodes (text segments) must be inside the same node when doing this operation.
    let node = tree.leafBackPointers[leafIndeces[0]];
    if (node.parent === null) {
        console.log("Already at the top. Cannot move up from root.");
        return;
    }
    let parent = node.parent;
    for (let i = 0; i < leafIndeces.length; i++) {
        parent.textIds.push(leafIndeces[i]);
        tree.leafBackPointers[leafIndeces[i]] = parent;
    }

    node.textIds = node.textIds.filter(id => !(leafIndeces.includes(id)));
    if (node.textIds.length === 0) {
        // Remove the node if it has become empty.
        removeNode(node);
    }
}
export function moveLeavesDown(tree: Tree, leafIndeces: number[]): void {
    // All leaf nodes (text segments) must be inside the same node when doing this operation.
    let node = tree.leafBackPointers[leafIndeces[0]];
    let newNode = addNode(tree, node, leafIndeces);
}
export function moveLeavesSideways(tree: Tree, leafIndeces: number[], direction: boolean): void {
    // direction is false for left, true for right
    let leftLeaf = leafIndeces[0];
    let rightLeaf = leafIndeces[leafIndeces.length - 1];
    let neighborIndex = direction ? rightLeaf + 1 : leftLeaf - 1;
    if (neighborIndex < 0 || neighborIndex >= tree.leafBackPointers.length) {
        // This should never happen because the buttons should be disabled in this case.
        console.log("Cannot move out of bounds.");
        return;
    }
    for (let i = 0; i < leafIndeces.length; i++) {
        let leafIndex = leafIndeces[i];
        let selfNode = tree.leafBackPointers[leafIndex];
        selfNode.textIds = selfNode.textIds.filter(id => id !== leafIndex);
        let neighborNode = tree.leafBackPointers[neighborIndex];
        tree.leafBackPointers[leafIndex] = neighborNode;
        neighborNode.textIds.push(leafIndex);
    }
    


}
export function deriveMovementOptions(tree: Tree): boolean[][] {
    // optionsForLeaves[i] describes the options for the i-th leaf node.
    // 0 is left, 1 is up, 2 is down, 3 is right
    let optionsForLeaves = new Array<boolean[]>(tree.leafBackPointers.length);
    for (let i = 0; i < tree.leafBackPointers.length; i++) {
        let node = tree.leafBackPointers[i];
        let options = new Array<boolean>(2);
        options[0] = i > 0 && tree.leafBackPointers[i-1] !== node;
        options[1] = node.parent !== null && node.parent.parent !== null;
        // If the node only points to one text segment, there is no point to moving the segment down.
        options[2] = node.textIds.length > 1;
        options[3] = i < tree.leafBackPointers.length - 1 && tree.leafBackPointers[i+1] !== node; 
        optionsForLeaves[i] = options;
    }
    return optionsForLeaves;
}
export function deriveMovementOptionsForSelected(tree: Tree, selectedLeafIndeces: number[]): boolean[] {
    let options = new Array<boolean>(4);
    options[0] = selectedLeafIndeces[0] > 0 && tree.leafBackPointers[selectedLeafIndeces[0]-1] !== tree.leafBackPointers[selectedLeafIndeces[0]];
    // Only allow moving up or down if all selected segments are in the same node.
    let allSameNode = true;
    let firstNode = tree.leafBackPointers[selectedLeafIndeces[0]];
    for (let i = 1; i < selectedLeafIndeces.length; i++) {
        if (tree.leafBackPointers[selectedLeafIndeces[i]] !== firstNode) {
            allSameNode = false;
            break;
        }
    }  
    let nodeContainsOtherLeaves = firstNode.textIds.length > selectedLeafIndeces.length; 
    // @ts-ignore
    options[1] = allSameNode && tree.leafBackPointers[selectedLeafIndeces[0]].parent !== null && tree.leafBackPointers[selectedLeafIndeces[0]].parent.parent !== null;
    options[2] = allSameNode && nodeContainsOtherLeaves ;
    options[3] = selectedLeafIndeces[selectedLeafIndeces.length - 1] < tree.leafBackPointers.length - 1 && tree.leafBackPointers[selectedLeafIndeces[selectedLeafIndeces.length - 1]+1] !== tree.leafBackPointers[selectedLeafIndeces[selectedLeafIndeces.length - 1]];
    return options;
}
export function deriveAssignments(tree: Tree): number[] {
    let assignments = [];
    let seenNodes = new Array<Node>();
    for (let i = 0; i < tree.leafBackPointers.length; i++) {
        let node = tree.leafBackPointers[i];
        if (!seenNodes.includes(node)) {
            seenNodes.push(node);
        }
        assignments.push(seenNodes.indexOf(node));
    }
    return assignments;
}

export function deepTreeCopy(node: Node): Node {
    let newNode: Node = {
        nodeId: node.nodeId,
        parent: node.parent,
        children: [],
        textIds: [...node.textIds],
    }
    for (let i = 0; i < node.children.length; i++) {
        newNode.children.push(deepTreeCopy(node.children[i]));
    }
    return newNode;
}