import { useParams, Link, useNavigate } from "react-router-dom";
import useMandalas from "@/hooks/useMandalas";
import Loader from "@/components/common/Loader";
import { ArrowLeftIcon, GlobeIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const MandalaListPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { mandalas, loading } = useMandalas(projectId || "");
  const navigate = useNavigate();
  if (!projectId) {
    return <div className="p-6 text-red-500">Error: Project ID not found</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-12">
      <div className="absolute top-10 left-10">
        <Link to={`/app/project/${projectId}`}>
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
      </div>
      <div className="w-full max-w-2xl px-4">
        <h1 className="text-2xl font-bold mb-6 text-center">Mandalas</h1>
        <Button
          color="primary"
          className="mb-10"
          onClick={() => {
            navigate(`/app/project/${projectId}/mandala/create`);
          }}
          icon={<PlusIcon size={16} />}
        >
          Create Mandala
        </Button>
        <div className="bg-white rounded-lg shadow-sm border">
          {loading && <Loader size="medium" text="Loading mandalas..." />}
          {mandalas.length === 0 && !loading ? (
            <p className="p-4 text-gray-600 text-center">
              No mandalas created yet.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {mandalas.map((mandala) => (
                <li
                  key={mandala.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <Link
                    to={`/app/project/${projectId}/mandala/${mandala.id}`}
                    className="flex items-center gap-3 p-4 text-gray-800 hover:text-blue-600 transition-colors"
                  >
                    <GlobeIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <span className="flex-1">
                      {mandala.name || "Mandala without name"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default MandalaListPage;
