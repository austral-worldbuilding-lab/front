import {Project} from "@/components/project/OrganizationProjectsList";

export const buildProjectTree = (projects: Project[]): Project[] => {
    const map = new Map<string, Project & { children: Project[] }>();
    projects.forEach((p) => map.set(p.id, { ...p, children: [] }));

    const roots: Project[] = [];
    const processed = new Set<string>();

    projects.forEach((p) => {
        if (p.rootProjectId === p.id) {
            roots.push(map.get(p.id)!);
            processed.add(p.id);
        }
    });

    const inferParent = (child: Project): string | null => {
        if (child.parentId) return child.parentId;

        const sameRoot = Array.from(processed).filter((id) => {
            const proj = map.get(id);
            return proj && proj.rootProjectId === child.rootProjectId;
        });

        let bestMatch: string | null = null;
        let longest = 0;

        for (const pid of sameRoot) {
            const parent = map.get(pid);
            if (!parent || pid === child.id) continue;
            const parentName = parent.name.trim();
            const childName = child.name.trim();
            if (
                childName.startsWith(parentName + ":") ||
                childName.startsWith(parentName + " -") ||
                childName.startsWith(parentName + " |")
            ) {
                if (parentName.length > longest) {
                    longest = parentName.length;
                    bestMatch = pid;
                }
            }
        }

        return bestMatch;
    };

    let unprocessed = projects.filter((p) => p.rootProjectId !== p.id);
    let iteration = 0;
    const maxIterations = 10;

    while (unprocessed.length > 0 && iteration < maxIterations) {
        iteration++;
        const remaining: typeof unprocessed = [];

        for (const p of unprocessed) {
            if (processed.has(p.id)) continue;
            const proj = map.get(p.id)!;
            const parentId = inferParent(p);

            if (parentId && map.has(parentId)) {
                map.get(parentId)!.children.push(proj);
                processed.add(p.id);
            } else if (p.rootProjectId && map.has(p.rootProjectId)) {
                map.get(p.rootProjectId)!.children.push(proj);
                processed.add(p.id);
            } else {
                remaining.push(p);
            }
        }

        unprocessed = remaining;
    }

    return roots;
};

export const filterProjectTree = (projects: Project[], search: string): Project[] => {
    if (!search.trim()) return projects;

    const lowerSearch = search.toLowerCase();

    return projects.reduce<Project[]>((acc, p) => {
        const nameMatches = p.name.toLowerCase().includes(lowerSearch);
        const filteredChildren = p.children
            ? filterProjectTree(p.children, search)
            : [];
        if (nameMatches || filteredChildren.length > 0) {
            acc.push({ ...p, children: filteredChildren });
        }
        return acc;
    }, []);
};
