import { UsefulResource } from "@/types/mandala";
import UsefulResourceItem from "./UsefulResourceItem";

interface UsefulResourcesListProps {
  resources: UsefulResource[];
}

const UsefulResourcesList = ({ resources }: UsefulResourcesListProps) => {
  if (resources.length === 0) {
    return (
      <div className="text-sm text-gray-500 text-center py-4">
        No hay recursos disponibles
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-y-auto border border-gray-200 rounded-[8px]">
      {resources.map((resource, index) => (
        <UsefulResourceItem key={index} resource={resource} />
      ))}
    </div>
  );
};

export default UsefulResourcesList;
