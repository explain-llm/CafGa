import { Tree, Node } from "../datatypes/tree";
import { findSentenceEnds, findParagraphEnds } from "./GroupedTextUtils";
function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
      (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    );
  }

export function initializeTree(numinputSegments:number): Tree {
    const root = {
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
    const newNode: Node = {
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
    const index = node.parent.children.indexOf(node);
    node.parent.children.splice(index, 1);
    node.parent = null;
}
export function makeTreeSerializable(root: Node | undefined): void {
    // Break circular references for serialization.
    if (root === undefined || root === null) {
        return;
    }
    const stack = [root];
    while (stack.length > 0) {
        const node = stack.pop();
        if (node === undefined) {
            continue;
        }
        node.children.forEach(child => stack.push(child));
        node.parent = null;
    }
}
export function recreateTree(root: Node): Tree {
    // Recreate the circular references after deserialization.
    const leafBackPointers = new Array<Node>();
    const stack = [root];
    while (stack.length > 0) {
        const node = stack.pop();
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
    const tree = initializeTree(assignments.length);
    const groups = new Map<number, number[]>(); // key is group id, value is list of text segment ids
    for (let i = 0; i < assignments.length; i++) {
        const group = groups.get(assignments[i]);
        if (group === undefined) {
            groups.set(assignments[i], [i]);
        } else {
            group.push(i);
        }
    }
    for (const [_, value] of groups) {
        addNode(tree, tree.root, value);
    }
    return tree;
}

export function moveLeavesUp(tree: Tree, leafIndeces: number[]): void {
    // All leaf nodes (text segments) must be inside the same node when doing this operation.
    const node = tree.leafBackPointers[leafIndeces[0]];
    if (node.parent === null) {
        return;
    }
    const parent = node.parent;
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
    const node = tree.leafBackPointers[leafIndeces[0]];
    addNode(tree, node, leafIndeces);
}
export function moveLeavesSideways(tree: Tree, leafIndeces: number[], direction: boolean): void {
    // direction is false for left, true for right
    const leftLeaf = leafIndeces[0];
    const rightLeaf = leafIndeces[leafIndeces.length - 1];
    const neighborIndex = direction ? rightLeaf + 1 : leftLeaf - 1;
    if (neighborIndex < 0 || neighborIndex >= tree.leafBackPointers.length) {
        // This should never happen because the buttons should be disabled in this case.
        return;
    }
    let leafIndex = 0;
    let selfNode;
    let neighborNode;
    for (let i = 0; i < leafIndeces.length; i++) {
        leafIndex = leafIndeces[i];
        selfNode = tree.leafBackPointers[leafIndex];
        selfNode.textIds = selfNode.textIds.filter(id => id !== leafIndex);
        neighborNode = tree.leafBackPointers[neighborIndex];
        tree.leafBackPointers[leafIndex] = neighborNode;
        neighborNode.textIds.push(leafIndex);
    }
    


}
export function deriveMovementOptions(tree: Tree): boolean[][] {
    // optionsForLeaves[i] describes the options for the i-th leaf node.
    // 0 is left, 1 is up, 2 is down, 3 is right
    const optionsForLeaves = new Array<boolean[]>(tree.leafBackPointers.length);
    let node;
    let options;
    for (let i = 0; i < tree.leafBackPointers.length; i++) {
        node = tree.leafBackPointers[i];
        options = new Array<boolean>(2);
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
    const options = new Array<boolean>(4);
    options[0] = selectedLeafIndeces[0] > 0 && tree.leafBackPointers[selectedLeafIndeces[0]-1] !== tree.leafBackPointers[selectedLeafIndeces[0]];
    // Only allow moving up or down if all selected segments are in the same node.
    let allSameNode = true;
    const firstNode = tree.leafBackPointers[selectedLeafIndeces[0]];
    for (let i = 1; i < selectedLeafIndeces.length; i++) {
        if (tree.leafBackPointers[selectedLeafIndeces[i]] !== firstNode) {
            allSameNode = false;
            break;
        }
    }  
    const nodeContainsOtherLeaves = firstNode.textIds.length > selectedLeafIndeces.length; 
    // @ts-expect-error
    options[1] = allSameNode && tree.leafBackPointers[selectedLeafIndeces[0]].parent !== null && tree.leafBackPointers[selectedLeafIndeces[0]].parent.parent !== null;
    options[2] = allSameNode && nodeContainsOtherLeaves ;
    options[3] = selectedLeafIndeces[selectedLeafIndeces.length - 1] < tree.leafBackPointers.length - 1 && tree.leafBackPointers[selectedLeafIndeces[selectedLeafIndeces.length - 1]+1] !== tree.leafBackPointers[selectedLeafIndeces[selectedLeafIndeces.length - 1]];
    return options;
}
export function deriveAssignments(tree: Tree): number[] {
    const assignments = [];
    const seenNodes = new Array<Node>();
    let node;
    for (let i = 0; i < tree.leafBackPointers.length; i++) {
        node = tree.leafBackPointers[i];
        if (!seenNodes.includes(node)) {
            seenNodes.push(node);
        }
        assignments.push(seenNodes.indexOf(node));
    }
    return assignments;
}

export function deepTreeCopy(node: Node): Node {
    const newNode: Node = {
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
export function getWordAssignments(inputSegments : string[]) : Tree {
    const tree = initializeTree(inputSegments.length);
    for (let i = 0; i < inputSegments.length; i++) {
        addNode(tree, tree.root, [i]);
    }
    return tree;
}
export function getSentenceAssignments(inputSegments: string[]): Tree {
    const hierarchy = initializeTree(inputSegments.length);
    const sentenceEnds = findSentenceEnds(inputSegments);
    const sentences = []
        let curIndex = 0;
        for (let i = 0; i < sentenceEnds.length; i++) {
            sentences.push(Array.from(new Array(sentenceEnds[i]-curIndex+1), (_, i) => i + curIndex))
            curIndex = sentenceEnds[i]+1;
        }
        for (let i = 0; i < sentences.length; i++) {
            addNode(hierarchy, hierarchy.root, sentences[i]);
        }
    return hierarchy;
}
export function getParagraphAssignments(inputSegments: string[]): Tree {
    const hierarchy = initializeTree(inputSegments.length);
    const paragraphEnds = findParagraphEnds(inputSegments);
    const paragraphs = []
    let curIndex = 0;
    for (let i = 0; i < paragraphEnds.length; i++) {
        paragraphs.push(Array.from(new Array(paragraphEnds[i] - curIndex + 1), (_, i) => i + curIndex))
        curIndex = paragraphEnds[i] + 1;
    }
    for (let i = 0; i < paragraphs.length; i++) {
        addNode(hierarchy, hierarchy.root, paragraphs[i]);
    }
    return hierarchy;
}