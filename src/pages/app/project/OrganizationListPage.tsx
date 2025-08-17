import { Link } from "react-router-dom";
import { Building2 } from "lucide-react";
import Loader from "@/components/common/Loader.tsx";
import useOrganizations from "@/hooks/useOrganizations.ts";

const OrganizationListPage = () => {
    const { organizations, loading, error } = useOrganizations();

    if (loading)
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader size="large" text="Cargando organizaciones..." />
            </div>
        );

    if (error) return <div className="text-red-500 p-4">{error.message}</div>;

    return (
        <div className="min-h-screen flex flex-col items-center pt-12">
            <div className="w-full max-w-2xl px-4">
                <h1 className="text-2xl font-bold mb-6 text-center">Organizaciones</h1>

                <div className="bg-white rounded-lg shadow-sm border">
                    {organizations.length === 0 ? (
                        <p className="p-4 text-gray-600 text-center">No hay organizaciones</p>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {organizations.map((org) => (
                                <li
                                    key={org.id}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <Link
                                        to={`/app/organization/${org.id}/projects`}
                                        className="flex items-center gap-3 p-4 text-gray-800 hover:text-blue-600 transition-colors"
                                    >
                                        <Building2 className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                        <span className="flex-1">{org.name}</span>
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

export default OrganizationListPage;
