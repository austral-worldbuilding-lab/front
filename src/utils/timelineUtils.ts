import { TimelineNode } from "@/components/project/TimelineTree";

export interface BackendTimelineNode {
    id: string;
    name?: string;
    description?: string;
    originQuestion?: string;
}

export interface BackendTimelineEdge {
    from: string;
    to: string;
    type: string;
    createdAt: string;
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

    const nodeMap = new Map(nodes.map(n => [n.id, { ...n, children: [] } as NodeWithChildren]));

    edges.forEach(edge => {
        const parent = nodeMap.get(edge.from);
        const child = nodeMap.get(edge.to);
        if (parent && child) parent.children.push(child);
    });

    const childIds = new Set(edges.map(e => e.to));
    const rootNodeRaw = nodes.find(n => !childIds.has(n.id));
    const rootNode = rootNodeRaw ? nodeMap.get(rootNodeRaw.id)! : null;

    if (!rootNode) return { id: "root", name: "Root", kind: "project", children: [] };

    const convertNode = (n: NodeWithChildren): TimelineNode => {
        const children: TimelineNode[] = [];

        for (const child of n.children) {
            let childNode = convertNode(child);

            if (child.originQuestion) {
                childNode = {
                    id: `${n.id}-${child.id}-prov`,
                    name: "provocación",
                    kind: "provocation",
                    question: child.originQuestion,
                    children: [childNode],
                };
            }

            children.push(childNode);
        }

        return {
            id: n.id,
            name: n.name ?? "Sin nombre",
            kind: "project",
            description: n.description,
            highlighted: n.id === projectId,
            question: n.originQuestion,
            children,
        };
    };

    if (rootNode.originQuestion) {
        return {
            id: `${rootNode.id}-prov-root`,
            name: "provocación inicial",
            kind: "provocation",
            question: rootNode.originQuestion,
            children: [convertNode(rootNode)],
        };
    }

    return convertNode(rootNode);
};
