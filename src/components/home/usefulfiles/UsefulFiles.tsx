import { useUsefulResources } from "@/hooks/useUsefulResources";
import { Button } from "../../ui/button";
import UsefulFilesContainer from "./UsefulFilesContainer";
import UsefulResourcesList from "./UsefulResourcesList";

const UsefulFiles = () => {
  const { resources, isLoading, error, refetch } = useUsefulResources();

  if (isLoading) {
    return (
      <UsefulFilesContainer>
        <div className="text-sm text-gray-500">Cargando...</div>
      </UsefulFilesContainer>
    );
  }

  if (error) {
    return (
      <UsefulFilesContainer>
        <div className="flex flex-col gap-3">
          <div className="text-sm text-red-500">
            Error al cargar los recursos
          </div>
          <Button variant="filled" color="primary" onClick={() => refetch()}>
            Reintentar
          </Button>
        </div>
      </UsefulFilesContainer>
    );
  }

  return (
    <UsefulFilesContainer>
      <UsefulResourcesList resources={resources} />
    </UsefulFilesContainer>
  );
};

export default UsefulFiles;
