import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface ProjectNode {
    id: string;
    name: string;
    kind: "project" | string;
    description?: string;
    children?: ProjectNode[];
}

interface TimelineTreeProps {
    data: ProjectNode;
    onWorldClick?: (node: ProjectNode) => void;
    className?: string
}

interface Position {
    x: number;
    y: number;
}

interface DraggableNode extends d3.HierarchyPointNode<ProjectNode> {
    _dragOffset?: { x: number; y: number };
    _dragged?: boolean;
}

export default function TimelineTree({ data, onWorldClick, className }: TimelineTreeProps) {
    const ref = useRef<SVGSVGElement | null>(null);
    const navigate = useNavigate();
    const { organizationId } = useParams<{ organizationId: string }>();

    useEffect(() => {
        if (!data) return;

        const width = 1200;
        const dx = 180;
        const dy = 280;

        const root = d3.hierarchy<ProjectNode>(data);
        const treeLayout = d3.tree<ProjectNode>().nodeSize([dx, dy]);
        treeLayout(root);

        const rootPointNode = root as DraggableNode;

        const savedPositions: Record<string, Position> = JSON.parse(
            localStorage.getItem("timelinePositions") || "{}"
        );
        rootPointNode.descendants().forEach((d) => {
            const pos = savedPositions[d.data.id];
            if (pos) {
                d.x = pos.x;
                d.y = pos.y;
            }
        });

        let left: DraggableNode = rootPointNode;
        let right: DraggableNode = rootPointNode;
        rootPointNode.eachBefore((d) => {
            if (d.x !== undefined && d.x < left.x) left = d as DraggableNode;
            if (d.x !== undefined && d.x > right.x) right = d as DraggableNode;
        });
        const height = (right.x ?? 0) - (left.x ?? 0) + dx * 2;

        const svg = d3.select(ref.current as SVGSVGElement);
        svg.selectAll("*").remove();
        svg
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", [0, 0, width, height].toString())
            .attr("style", "font: 12px sans-serif; user-select: none;");

        const g = svg.append("g").attr("transform", `translate(${dy / 2}, ${dx})`);

        const zoom = d3
            .zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.3, 3])
            .on("zoom", (event) => g.attr("transform", event.transform.toString()));
        (svg as d3.Selection<SVGSVGElement, unknown, null, undefined>).call(zoom);

        const diagonal = d3
            .linkHorizontal<d3.HierarchyPointLink<ProjectNode>, d3.HierarchyPointNode<ProjectNode>>()
            .x(d => d.y ?? 0)
            .y(d => d.x ?? 0);


        const gLink = g
            .append("g")
            .attr("fill", "none")
            .attr("stroke", "#888")
            .attr("stroke-opacity", 0.7)
            .attr("stroke-width", 2);

        const links = rootPointNode.links();
        gLink
            .selectAll<SVGPathElement, d3.HierarchyPointLink<ProjectNode>>("path")
            .data(links)
            .join("path")
            .attr("d", (d) => diagonal(d as d3.HierarchyPointLink<ProjectNode>) ?? "");


        const tooltip = d3
            .select("body")
            .append("div")
            .attr("class", "timeline-tooltip")
            .style("position", "absolute")
            .style("pointer-events", "none")
            .style("padding", "10px 14px")
            .style("background", "rgba(0,0,0,0.85)")
            .style("color", "#fff")
            .style("font-size", "12px")
            .style("border-radius", "6px")
            .style("opacity", 0);

        const provLinks = links.filter((d) => d.target.data.description);
        const gProv = g.append("g");
        const gProvItems: { node: DraggableNode; gItem: d3.Selection<SVGGElement, unknown, SVGGElement, unknown> }[] = [];

        provLinks.forEach((d) => {
            const midX = ((d.source.y ?? 0) + (d.target.y ?? 0)) / 2;
            const midY = ((d.source.x ?? 0) + (d.target.x ?? 0)) / 2;

            const gItem = gProv
                .append("g")
                .attr("transform", `translate(${midX}, ${midY})`)
                .style("cursor", "pointer")
                .on("mouseover", () => {
                    tooltip.transition().duration(200).style("opacity", 1);
                    tooltip.html(d.target.data.description || "Sin descripción");
                })
                .on("mousemove", (event) => {
                    tooltip.style("left", event.pageX + 12 + "px").style("top", event.pageY + 12 + "px");
                })
                .on("mouseout", () => {
                    tooltip.transition().duration(200).style("opacity", 0);
                }) as unknown as d3.Selection<SVGGElement, unknown, SVGGElement, unknown>;


            gItem.append("circle").attr("r", 16).attr("fill", "#1E3A8A");

            gItem
                .append("foreignObject")
                .attr("x", -10)
                .attr("y", -10)
                .attr("width", 20)
                .attr("height", 20)
                .append("xhtml:div")
                .style("display", "flex")
                .style("justify-content", "center")
                .style("align-items", "center")
                .html("💭");

            gProvItems.push({ node: d.target as DraggableNode, gItem });
        });

        const node = g
            .append("g")
            .selectAll<SVGGElement, DraggableNode>("g")
            .data(rootPointNode.descendants().filter((d) => d.data.kind === "project") as DraggableNode[])
            .join("g")
            .attr("transform", (d) => `translate(${d.y ?? 0},${d.x ?? 0})`)
            .style("cursor", "pointer");

        node
            .append("circle")
            .attr("r", 60)
            .attr("fill", "#FFF")
            .attr("stroke", "#1E3A8A")
            .attr("stroke-width", 3);

        node
            .append("text")
            .attr("text-anchor", "middle")
            .attr("fill", "#1E3A8A")
            .attr("font-weight", "600")
            .attr("font-size", "12px")
            .text((d) => d.data.name)
            .call(wrap, 60);

        const dragHandler = d3
            .drag<SVGGElement, DraggableNode>()
            .on("start", function (event, d) {
                d._dragOffset = { x: (d.y ?? 0) - event.x, y: (d.x ?? 0) - event.y };
                d._dragged = false;
            })
            .on("drag", function (event, d) {
                d._dragged = true;
                const newX = event.y + d._dragOffset!.y;
                const newY = event.x + d._dragOffset!.x;

                d3.select(this).attr("transform", `translate(${newY},${newX})`);

                d.x = newX;
                d.y = newY;

                gLink
                    .selectAll<SVGPathElement, d3.HierarchyPointLink<ProjectNode>>("path")
                    .data(links)
                    .join("path")
                    .attr("d", (d: d3.HierarchyPointLink<ProjectNode>) => diagonal(d) ?? "");

                gProvItems.forEach((item) => {
                    const l = links.find((link) => link.target === item.node);
                    if (!l) return;
                    const midX = ((l.source.y ?? 0) + (l.target.y ?? 0)) / 2;
                    const midY = ((l.source.x ?? 0) + (l.target.x ?? 0)) / 2;
                    item.gItem.attr("transform", `translate(${midX}, ${midY})`);
                });
            })
            .on("end", function (event, d) {
                if (!d._dragged) {
                    navigate(`/app/organization/${organizationId}/projects/${d.data.id}`);
                } else {
                    d.x = event.y + d._dragOffset!.y;
                    d.y = event.x + d._dragOffset!.x;

                    const positions: Record<string, Position> = JSON.parse(localStorage.getItem("timelinePositions") || "{}");
                    positions[d.data.id] = { x: d.x ?? 0, y: d.y ?? 0 };
                    localStorage.setItem("timelinePositions", JSON.stringify(positions));
                }
            });

        node.call(dragHandler);

        function wrap(
            textSelection: d3.Selection<SVGTextElement, DraggableNode, SVGGElement, unknown>,
            radius: number
        ) {
            textSelection.each(function () {
                const textEl = d3.select(this);
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
                    while (tspan.node()!.getComputedTextLength() > radius * 1.5) {
                        const currentSize = parseFloat(textEl.style("font-size")) || 12;
                        if (currentSize > 10) {
                            textEl.style("font-size", currentSize - 0.5 + "px");
                        } else {
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
                }

                const tspans = textEl.selectAll<SVGTextElement, string>("tspan");
                tspans.attr("dy", (_, i) => (i - lineNumber / 2) * lineHeight + 0.35 + "em");
            });
        }
    }, [data, onWorldClick, navigate, organizationId]);

    return <svg className={className} ref={ref}></svg>;
}
