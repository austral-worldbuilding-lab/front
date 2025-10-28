import { Sheet, SheetContent } from "@/components/ui/sheet";
import FileListContainer from "@/components/files/FileListContainer";
import { FileScope } from "@/services/filesService.ts";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  id: string;
  scope: FileScope;
  organizationName?: string; // opcional, por si luego lo necesitás
  projectName?: string; // opcional, por si luego lo necesitás
}

const FilesDrawer = ({
  open,
  onClose,
  scope,
  id,
  organizationName,
  projectName,
}: Props) => {
  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent
        side="right"
        className="w-[32rem] flex flex-col rounded-l-xl"
      >
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <FileListContainer
            scope={scope}
            id={id}
            organizationName={organizationName}
            projectName={projectName}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FilesDrawer;
