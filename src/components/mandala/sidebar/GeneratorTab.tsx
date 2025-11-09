import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuestionsPanel from "@/components/mandala/sidebar/QuestionsPanel.tsx";
import PostItsPanel from "@/components/mandala/sidebar/PostItsPanel.tsx";
import FiltersPanel, {
  FiltersState,
} from "@/components/mandala/sidebar/FiltersPanel.tsx";
import type { Tag } from "@/types/mandala";
import {ImageIcon, MessageCircleQuestion, StickyNote} from "lucide-react";
import ImagesPanel from "@/components/mandala/sidebar/ImagesPanel.tsx";

export interface GeneratorTabProps {
  mandalaId: string;
  organizationId: string;
  projectId: string;
  sections: string[];
  scales: string[];
  tags: Tag[];
  onNewTag: (tag: Tag) => void;
  onCreatePostIt: (
    content: string,
    tags: Tag[],
    postItFatherId?: string
  ) => void;
  dimensionsMandala: { name: string; color: string }[];
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
  dimensionsMandala,
}: GeneratorTabProps) {
  const [activeTab, setActiveTab] = useState<"questions" | "postits" | "images">(
    "questions"
  );
  const [filters, setFilters] = useState<FiltersState>({
    sections: Object.fromEntries(sections.map((s) => [s, false])),
    scales: Object.fromEntries(scales.map((s) => [s, false])),
  });

  const selected = useMemo(() => {
    const selSections = Object.keys(filters.sections).filter(
      (k) => filters.sections[k]
    );
    const selScales = Object.keys(filters.scales).filter(
      (k) => filters.scales[k]
    );
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
            <TabsList
                className="flex flex-wrap justify-between w-full gap-2 bg-white border border-gray-200 rounded-lg shadow-sm p-1"
            >
              <TabsTrigger
                  value="questions"
                  className="flex flex-1 min-w-[100px] sm:min-w-0 items-center justify-center gap-2 text-center px-3 py-2 text-sm font-medium leading-tight whitespace-normal break-words rounded-md transition-colors duration-150 data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-gray-50"
              >
                <MessageCircleQuestion className="w-4 h-4 shrink-0" />
                <span className="block">Máquina de preguntas</span>
              </TabsTrigger>

              <TabsTrigger
                  value="postits"
                  className="flex flex-1 min-w-[100px] sm:min-w-0 items-center justify-center gap-2 text-center px-3 py-2 text-sm font-medium leading-tight whitespace-normal break-words rounded-md transition-colors duration-150 data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-gray-50"
              >
                <StickyNote className="w-4 h-4 shrink-0" />
                <span className="block">Generador de Post-Its</span>
              </TabsTrigger>

              <TabsTrigger
                  value="images"
                  className="flex flex-1 min-w-[100px] sm:min-w-0 items-center justify-center gap-2 text-center px-3 py-2 text-sm font-medium leading-tight whitespace-normal break-words rounded-md transition-colors duration-150 data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-gray-50"
              >
                <ImageIcon className="w-4 h-4 shrink-0" />
                <span className="block">Generador de Imágenes</span>
              </TabsTrigger>
            </TabsList>

          <TabsContent
            value="questions"
            className="flex flex-col flex-1 min-h-0"
          >
            <QuestionsPanel
              mandalaId={mandalaId}
              organizationId={organizationId}
              projectId={projectId}
              selected={selected}
              dimensions={dimensionsMandala}
            >
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
                  dimensions={dimensionsMandala}
              >
                <FiltersPanel
                    sections={sections}
                    scales={scales}
                    value={filters}
                    onChange={setFilters}
                />
              </PostItsPanel>
            </TabsContent>
            <TabsContent value="images" className="flex flex-col flex-1 min-h-0">
              <ImagesPanel
                  mandalaId={mandalaId}
                  organizationId={organizationId}
                  projectId={projectId}
                  selected={selected}
                  dimensions={dimensionsMandala}
                  allTags={tags}
                onNewTag={onNewTag}>

                <FiltersPanel
                    sections={sections}
                    scales={scales}
                    value={filters}
                    onChange={setFilters}
                />
              </ImagesPanel>
            </TabsContent>
          </Tabs>
        </div>
      </div>
  );
}
