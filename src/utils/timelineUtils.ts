export interface TimelineNode {
    id: string;
    name: string;
    kind: "project" | "provocation";
    children: TimelineNode[];
    question?: string;
    description?: string;
}

export interface BackendTimelineNode {
    id: string;
    type: string;
    name?: string;
    label?: string;
    description?: string;
    parentId?: string | null;
    depth?: number;
}

export interface BackendTimelineEdge {
    from: string;
    to: string;
}

export interface BackendTimelineResponse {
    nodes: BackendTimelineNode[];
    edges: BackendTimelineEdge[];
}

interface NodeWithChildren extends BackendTimelineNode {
    children: NodeWithChildren[];
}

export const buildTimelineTree = (
    nodes?: BackendTimelineNode[],
    edges?: BackendTimelineEdge[],
    projectId?: string
): TimelineNode => {
    if (!nodes || !edges || !projectId) {
        return { id: "root", name: "Root", kind: "project", children: [] };
    }

    const nodeMap = new Map(
        nodes.map(n => [n.id, { ...n, children: [] } as NodeWithChildren])
    );

    edges.forEach(edge => {
        const parent = nodeMap.get(edge.from); // from = padre
        const child = nodeMap.get(edge.to);    // to = hijo
        if (parent && child) parent.children.push(child);
    });

    const findRoot = (node: NodeWithChildren): NodeWithChildren => {
        if (!node.parentId) return node; // ya es raíz
        const parent = nodeMap.get(node.parentId);
        return parent ? findRoot(parent) : node;
    };

    const currentNode = nodeMap.get(projectId);
    if (!currentNode) return { id: "root", name: "Root", kind: "project", children: [] };

    const rootNode = findRoot(currentNode);

    const convertNode = (n: NodeWithChildren): TimelineNode => ({
        id: n.id,
        name: n.name || n.label || "Unnamed",
        kind: n.type === "project" ? "project" : "provocation",
        children: n.children.map(convertNode),
        question: n.type !== "project" ? n.description || n.label : undefined,
        description: n.description,
    });


    return convertNode(rootNode);
};

