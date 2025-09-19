export interface Tree {
    root: Node;
    // Array of nodes where the i-th entry is the node that points to the i-th text segment.
    // In other words the text segments are virtual leaf nodes that are not stored in the tree.
    leafBackPointers: Node[];
    
}
export interface Node {
    nodeId: string;
    parent: Node|null;
    children: Node[];
    textIds: number[];

}