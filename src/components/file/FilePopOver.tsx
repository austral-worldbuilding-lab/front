import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import ProjectFilesList from "@/components/project/FileList";

interface FilesPopoverProps {
  projectId: string;
  scope: "organization" | "project" | "mandala";
}

export default function FilesPopover({ projectId, scope }: FilesPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Ver archivos</Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-4 max-h-[400px] overflow-y-auto bg-white">
        <h4 className="font-medium mb-2">Archivos del proyecto</h4>
        <ProjectFilesList scope={scope} id={projectId} />
      </PopoverContent>
    </Popover>
  );
}
