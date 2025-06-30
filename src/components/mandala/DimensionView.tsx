import React, { useState } from "react";
import useMandala from "@/hooks/useMandala.ts";
import Loader from "@/components/common/Loader.tsx";
import { cn } from "@/lib/utils";
import {
  deletePostit,
  updatePostit,
  createPostit as createPostitService,
} from "@/services/mandalaService.ts";
import DimensionPostit from "@/components/mandala/postits/DimensionPostit.tsx";
import { useParams } from "react-router-dom";
import NewPostItModal from "@/components/mandala/postits/NewPostItModal.tsx";
import { useTags } from "@/hooks/useTags";
import EditPostItModal from "@/components/mandala/postits/EditPostitModal.tsx";
import {useEditPostIt} from "@/hooks/useEditPostit.ts";


interface MandalaDimensionProps {
  dimensionName: string;
  mandalaId: string;
}

const DimensionView: React.FC<MandalaDimensionProps> = ({
                                                          dimensionName,
                                                          mandalaId,
                                                        }) => {
  const { mandala, loading, error } = useMandala(mandalaId);
  const config = mandala?.mandala.configuration;
  const { projectId } = useParams<{ projectId: string }>();
  const { tags, createTag } = useTags(projectId ?? "");
  const [isChildModalOpen, setIsChildModalOpen] = useState(false);
  const [postitFatherId, setPostitFatherId] = useState<string | undefined>();

    const {
        isOpen: isEditModalOpen,
        postit: editingPostit,
        open: openEditModal,
        close: closeEditModal,
        handleUpdate,
    } = useEditPostIt();

  if (!projectId) {
    return <div className="text-red-500">Project ID is required</div>;
  }


  if (loading) return <Loader />;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;

  return (
    <div className="flex flex-col justify-center items-center w-[90vw] h-[80vh]">
      <div className="flex items-center justify-center absolute top-5 left-1/2 -translate-x-1/2">
        <span className="text-blue-900 font-bold text-lg transform whitespace-nowrap">
          {dimensionName.toUpperCase()}
        </span>
      </div>

      {/* Contenedor de columnas */}
      <div className="flex flex-col h-full w-full">
        <div className="flex flex-row items-stretch h-full w-full">
          {config?.scales.map((scaleName, index) => (
            <div key={index} className="flex flex-col w-full h-full">
              <div
                className={cn(
                  "flex flex-col w-full items-center overflow-y-scroll custom-scrollbar p-3 h-[95%] border-l-2 border-white bg-blue-200",
                  index === 0 && "border-l-0 rounded-bl-xl rounded-tl-xl",
                  index === config?.scales.length - 1 &&
                    "rounded-br-xl rounded-tr-xl"
                )}
                style={{ minWidth: 0 }}
              >
                <div className="flex flex-wrap gap-2 w-full justify-start ">
                  {mandala?.postits
                      .filter(
                          (p) =>
                              p.dimension.toLowerCase() === dimensionName.toLowerCase() &&
                              p.section.toLowerCase() === scaleName.toLowerCase()
                      )
                      .map((postit) => {
                        const dimensionColor =
                            mandala.mandala.configuration?.dimensions.find(
                                (d) => d.name.toLowerCase() === postit.dimension.toLowerCase()
                            )?.color ?? "#facc15";

                        return (
                            <DimensionPostit
                                key={postit.id}
                                postit={postit}
                                onUpdate={(updates) =>
                                    updatePostit(
                                        projectId,
                                        mandalaId,
                                        postit.id!,
                                        updates
                                    )
                                }
                                onDelete={() =>
                                    deletePostit(projectId, mandalaId, postit.id!)
                                }
                                onCreateChild={() => {
                                  setPostitFatherId(postit.id);
                                  setIsChildModalOpen(true);
                                }}
                                onEdit={() => openEditModal(mandalaId, postit)}

                            />
                            );
                          })}
                </div>
              </div>
              <div
                key={index}
                className="flex-1 flex justify-center items-center p-2"
              >
                <span className="text-blue-900 font-bold text-xs text-center">
                  {scaleName}
                </span>
                  </div>
                </div>
            ))}
          </div>
        </div>

        <NewPostItModal
            isOpen={isChildModalOpen}
            onOpenChange={setIsChildModalOpen}
            tags={tags}
            postItFatherId={postitFatherId}
            onNewTag={async (tag) => {
              try {
                await createTag(tag.name, tag.color);
              } catch (e) {
                console.error("Error creating tag:", e);
              }
            }}
            onCreate={async (content, selectedTags, parentId) => {
              await createPostitService(
                  mandalaId,
                  {
                    content,
                    tags: selectedTags,
                    coordinates: { x: 0, y: 0, angle: 0, percentileDistance: 0 },
                    dimension: dimensionName,
                    section: "Institución",
                  },
                  parentId
              );

              setIsChildModalOpen(false);
              setPostitFatherId(undefined);
            }}
        />
        {editingPostit && (
            <EditPostItModal
                isOpen={isEditModalOpen}
                onOpenChange={(open) => {
                    if (!open) closeEditModal();
                }}
                tags={tags}
                onUpdate={handleUpdate}
                initialContent={editingPostit.content}
                initialTags={editingPostit.tags}
                onNewTag={async (tag) => {
                    try {
                        await createTag(tag.name, tag.color);
                    } catch (e) {
                        console.error("Error creating tag:", e);
                    }
                }}
            />
        )}

    </div>
  );
};

export default DimensionView;
