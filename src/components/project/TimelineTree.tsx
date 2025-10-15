import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

export interface TimelineNode {
    id: string;
    name: string;
    kind: "project" | "provocation";
    description?: string;
    question?: string;
    highlighted?: boolean;
    children: TimelineNode[];
}

interface TimelineTreeProps {
    data: TimelineNode;
    className?: string;
}

export default function TimelineTree({ data, className }: TimelineTreeProps) {
    const ref = useRef<SVGSVGElement | null>(null);
    const navigate = useNavigate();
    const { organizationId } = useParams<{ organizationId: string }>();

    useEffect(() => {
        if (!data) return;

        const width = 1200;
        const dx = 150;
        const dy = 200;
        const nodeRadius = 60;

        const root = d3.hierarchy<TimelineNode>(data);
        const treeLayout = d3.tree<TimelineNode>().nodeSize([dx, dy]);
        treeLayout(root);

        const svg = d3.select(ref.current as SVGSVGElement);
        svg.selectAll("*").remove();

        svg
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", [0, 0, width, dx * 5].toString())
            .attr("style", "font: 12px sans-serif; user-select: none;");

        const g = svg.append("g").attr("transform", `translate(${dy / 2}, ${dx})`);

        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.3, 3])
            .on("zoom", (event) => g.attr("transform", event.transform.toString()));
        svg.call(zoom);

        const defs = svg.append("defs");
        defs.append("marker")
            .attr("id", "arrowhead")
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 20)
            .attr("refY", 0)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,-5L10,0L0,5")
            .attr("fill", "#1E3A8A");

        const diagonal = d3
            .linkHorizontal<
                d3.HierarchyPointLink<TimelineNode>,
                d3.HierarchyPointNode<TimelineNode>
            >()
            .x((d) => d.y ?? 0)
            .y((d) => d.x ?? 0);

        g.append("g")
            .attr("fill", "none")
            .attr("stroke", "#1E3A8A")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", 2)
            .selectAll<SVGPathElement, d3.HierarchyPointLink<TimelineNode>>("path")
            .data(root.links())
            .join("path")
            .attr("d", (d) => {
                // Cast to HierarchyPointLink to ensure x and y are defined
                const link = d as d3.HierarchyPointLink<TimelineNode>;
                return diagonal(link) ?? "";
            })
            .attr("marker-end", (d) =>
                d.source.data.kind === "project" && d.target.data.kind === "project"
                    ? "url(#arrowhead)"
                    : null
            );

        const node = g
            .append("g")
            .selectAll<SVGGElement, d3.HierarchyPointNode<TimelineNode>>("g")
            .data(root.descendants())
            .join("g")
            .attr("transform", (d) => `translate(${d.y ?? 0},${d.x ?? 0})`)
            .style("cursor", "pointer")
            .on("click", (_, d) => {
                if (d.data.kind === "project") {
                    navigate(`/app/organization/${organizationId}/projects/${d.data.id}`);
                }
            });

        const projectNodes = node.filter((d) => d.data.kind === "project");
        projectNodes
            .append("circle")
            .attr("r", nodeRadius)
            .attr("fill", (d) => (d.data.highlighted ? "#1E3A8A" : "#FFF"))
            .attr("stroke", "#1E3A8A")
            .attr("stroke-width", 3);

        projectNodes
            .append("text")
            .attr("text-anchor", "middle")
            .attr("fill", (d) => (d.data.highlighted ? "#FFF" : "#1E3A8A"))
            .attr("font-weight", "600")
            .attr("font-size", "12px")
            .text((d) => d.data.name)
            .each(function() {
                wrapText(d3.select(this), nodeRadius);
            });

        const provNodes = node.filter((d) => d.data.kind === "provocation");
        provNodes.each(function (d) {
            const nodeGroup = d3.select<SVGGElement, d3.HierarchyPointNode<TimelineNode>>(this);
            const textEl = nodeGroup
                .append("text")
                .attr("text-anchor", "middle")
                .attr("fill", "#1E3A8A")
                .attr("font-weight", "500")
                .attr("font-size", "11px")
                .text(d.data.question || "¿Qué pasaría si...?");

            wrapText(d3.select(textEl.node() as SVGTextElement), 90);

            const bbox = (textEl.node() as SVGTextElement).getBBox();
            nodeGroup
                .insert("rect", "text")
                .attr("x", bbox.x - 10)
                .attr("y", bbox.y - 5)
                .attr("width", bbox.width + 20)
                .attr("height", bbox.height + 10)
                .attr("rx", 10)
                .attr("fill", "#F3F4F6")
                .attr("stroke", "#9CA3AF")
                .attr("stroke-width", 2);
        });

        function wrapText(
            textSelection: d3.Selection<SVGTextElement, unknown, null, undefined>,
            radius: number
        ): void {
            const textEl = textSelection;
            const words = (textEl.text() || "").split(/\s+/).reverse();
            let word: string | undefined;
            let line: string[] = [];
            let lineNumber = 0;
            const lineHeight = 1.1;
            const y = 0;
            const dy = 0.35;
            textEl.text(null);

            let tspan = textEl.append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");

            while ((word = words.pop())) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node()!.getComputedTextLength() > radius * 1.8) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = textEl
                        .append("tspan")
                        .attr("x", 0)
                        .attr("y", y)
                        .attr("dy", ++lineNumber * lineHeight + dy + "em")
                        .text(word);
                }
            }

            const tspans = textEl.selectAll<SVGTextElement, unknown>("tspan");
            tspans.attr("dy", (_, i) => (i - lineNumber / 2) * lineHeight + 0.35 + "em");
        }
    }, [data, navigate, organizationId]);

    return <svg className={className} ref={ref}></svg>;
}