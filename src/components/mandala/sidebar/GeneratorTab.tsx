import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuestionsPanel from "@/components/mandala/sidebar/QuestionsPanel.tsx";
import PostItsPanel from "@/components/mandala/sidebar/PostItsPanel.tsx";
import FiltersPanel, { FiltersState } from "@/components/mandala/sidebar/FiltersPanel.tsx";
import type { Tag } from "@/types/mandala";

export interface GeneratorTabProps {
    mandalaId: string;
    organizationId: string;
    projectId: string;
    sections: string[];
    scales: string[];
    tags: Tag[];
    onNewTag: (tag: Tag) => void;
    onCreatePostIt: (content: string, tags: Tag[], postItFatherId?: string) => void;
}

export default function GeneratorTab({
                                         mandalaId,
                                         organizationId,
                                         projectId,
                                         sections,
                                         scales,
                                         tags,
                                         onCreatePostIt,
                                         onNewTag,
                                     }: GeneratorTabProps) {
    const [activeTab, setActiveTab] = useState<"questions" | "postits">("questions");
    const [filters, setFilters] = useState<FiltersState>({
        sections: Object.fromEntries(sections.map((s) => [s, false])),
        scales: Object.fromEntries(scales.map((s) => [s, false])),
    });

    const selected = useMemo(() => {
        const selSections = Object.keys(filters.sections).filter((k) => filters.sections[k]);
        const selScales = Object.keys(filters.scales).filter((k) => filters.scales[k]);
        return {
            dimensions: selSections.length ? selSections : sections,
            scales: selScales.length ? selScales : scales,
        };
    }, [filters, sections, scales]);

    return (
        <div className="flex-1 min-h-0 flex flex-col">
            <div className="px-4 pt-3 flex-1 min-h-0 flex flex-col">
                <Tabs
                    value={activeTab}
                    onValueChange={(v) => setActiveTab(v as any)}
                    className="flex-1 min-h-0 flex flex-col"
                >
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="questions">Preguntas</TabsTrigger>
                        <TabsTrigger value="postits">Post-Its</TabsTrigger>
                    </TabsList>

                    <TabsContent value="questions" className="flex flex-col flex-1 min-h-0">
                        <QuestionsPanel mandalaId={mandalaId} organizationId={organizationId} projectId={projectId} selected={selected}>
                            <FiltersPanel
                                sections={sections}
                                scales={scales}
                                value={filters}
                                onChange={setFilters}
                            />
                        </QuestionsPanel>
                    </TabsContent>

                    <TabsContent value="postits" className="flex flex-col flex-1 min-h-0">
                        <PostItsPanel
                            mandalaId={mandalaId}
                            organizationId={organizationId}
                            projectId={projectId}
                            selected={selected}
                            tags={tags}
                            onCreate={onCreatePostIt}
                            onNewTag={onNewTag}
                        >
                            <FiltersPanel
                                sections={sections}
                                scales={scales}
                                value={filters}
                                onChange={setFilters}
                            />
                        </PostItsPanel>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
