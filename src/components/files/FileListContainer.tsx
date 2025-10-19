import { useState } from "react";
import { FileText, Search, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useFiles } from "@/hooks/useFiles";
import Loader from "@/components/common/Loader";
import FileLoader from "@/components/files/FileLoader";
import { FileItem } from "@/types/mandala";
import { FileScope } from "@/services/filesService";
import FileRow from "./FileRow";
import SelectAllFilesButton from "./SelectAllFilesButton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FileListContainerProps {
  scope: FileScope;
  id: string;
  organizationName?: string;
  projectName?: string;
}

const FileListContainer = ({
  scope,
  id,
  organizationName,
  projectName,
}: FileListContainerProps) => {
  const [searchText, setSearchText] = useState("");
  const {
    files,
    isLoading,
    error,
    refetch,
    selectAllFiles,
    selectedCount,
    totalCount,
    isUpdatingSelections,
  } = useFiles(scope, id, true);

  const filteredFiles = files.filter((file) =>
    file.file_name.toLowerCase().includes(searchText.toLowerCase())
  );

  const groupedFiles: Record<string, FileItem[]> = {};
  filteredFiles.forEach((file) => {
    const key = file.source_scope || "unknown";
    if (!groupedFiles[key]) groupedFiles[key] = [];
    groupedFiles[key].push(file);
  });

  const scopeOrder = ["organization", "project", "mandala"];

  const getScopeTitle = (scopeKey: string) => {
    switch (scopeKey) {
      case "organization":
        return organizationName;
      case "project":
        return projectName;
      case "mandala":
        return "Archivos de la mandala";
      default:
        return scopeKey;
    }
  };

  return (
    <div className="flex flex-col gap-4 bg-white rounded-[12px] border border-gray-200 overflow-hidden px-5 py-4 lg:max-w-[450px] min-w-[300px] flex-1 min-h-0">
      <div className="flex items-center justify-between flex-wrap w-full gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <FileText size={20} className="text-foreground" />
          <span className="font-semibold text-xl text-foreground">
            Archivos
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="w-4 h-4 text-primary cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="w-full text-sm">
                Los siguientes archivos darán contexto a la IA a la hora de
                generar mandalas, postits o preguntas. Selecciónalos
                adecuadamente.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex items-center gap-2 flex-wrap w-full">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Buscar por nombre"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <FileLoader scope={scope} id={id} onUploadComplete={refetch} />
        </div>
      </div>

      {totalCount > 0 && (
        <div className="flex justify-start">
          <SelectAllFilesButton
            selectedCount={selectedCount}
            totalCount={totalCount}
            onSelectAll={selectAllFiles}
            isUpdating={isUpdatingSelections}
          />
        </div>
      )}

      <div className="border border-gray-200 rounded-md flex flex-col flex-1 overflow-hidden min-h-0">
        {isLoading && (
          <div className="p-8 h-full flex items-center justify-center">
            <Loader size="medium" text="Cargando archivos..." />
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center p-8">
            <div className="text-center max-w-md">
              <h2 className="text-lg font-semibold text-red-600 mb-3">
                Error al cargar archivos
              </h2>
              <p className="text-gray-600 mb-4">
                {error instanceof Error
                  ? error.message
                  : "Error al cargar los archivos"}
              </p>
            </div>
          </div>
        )}

        {!error && !isLoading && (!files || files.length === 0) && (
          <p className="p-4 text-gray-600 text-center">
            No hay archivos cargados aún.
          </p>
        )}

        {!error && !isLoading && files.length > 0 && (
          <div className="flex-1 overflow-y-auto max-h-[450px] min-h-0">
            <Accordion
              type="multiple"
              defaultValue={scopeOrder}
              className="w-full"
            >
              {scopeOrder.map(
                (scopeKey) =>
                  groupedFiles[scopeKey] && (
                    <AccordionItem
                      key={scopeKey}
                      value={scopeKey}
                      className="border-none"
                    >
                      <AccordionTrigger className="px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left font-semibold text-gray-800 hover:no-underline rounded-none border-b border-gray-200 text-base cursor-pointer">
                        <div className="flex items-center justify-between w-full pr-2">
                          <span>{getScopeTitle(scopeKey)}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="p-0">
                        <div className="divide-y divide-gray-100">
                          {groupedFiles[scopeKey].map((file, index) => (
                            <FileRow
                              key={index}
                              file={file}
                              scope={scope}
                              id={id}
                            />
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )
              )}
            </Accordion>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileListContainer;
