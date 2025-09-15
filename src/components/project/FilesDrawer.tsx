import FileList from "@/components/project/FileList";
import Loader from "@/components/common/Loader";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {Info, X} from "lucide-react";
import FileLoader from "@/components/project/FileLoader.tsx";
import {FileScope} from "@/services/filesService.ts";
import {useFiles} from "@/hooks/useFiles.ts";
import { useProjectAccess } from "@/hooks/useProjectAccess";
import { useParams } from "react-router-dom";


interface Props {
    open: boolean;
    onClose: () => void;
    title: string;
    id: string;
    scope: FileScope;
}

const FilesDrawer = ({ open, onClose, title, scope, id }: Props) => {
    const { projectId } = useParams<{ projectId: string }>();
    const { hasAccess, userRole } = useProjectAccess(projectId || "");
    const canEdit = !!hasAccess && (userRole === null || ['owner', 'admin', 'member'].includes(userRole));
    const { files, isLoading, error, refetch } = useFiles(scope, id);

    return (
        <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <SheetContent
                side="right"
                closeIcon={<X className="w-5 h-5" />}
                className="w-[32rem] px-6 py-4 flex flex-col"
            >
                <SheetHeader className="flex justify-between items-center mb-2">
                    <SheetTitle className="text-lg font-bold">{title}</SheetTitle>
                </SheetHeader>

                {canEdit && (
                    <div className="mb-1">
                        <FileLoader onUploadComplete={refetch} scope={scope} id={id}/>
                    </div>
                )}

                <p className="flex items-start gap-1 text-sm italic text-gray-500 mt-1">
                    <Info className="w-6 h-4 mt-0.5"/>
                    Los siguientes archivos darán contexto a la IA a la hora de generar mandalas, postits o
                    preguntas. Selecciónalos adecuadamente.
                </p>

                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <Loader size="small" text="Cargando archivos..." />
                    ) : (
                        <FileList
                            id={id}
                            files={files}
                            loading={isLoading}
                            error={error ?? undefined}
                            scope={scope}
                            open={open}
                        />
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default FilesDrawer;
