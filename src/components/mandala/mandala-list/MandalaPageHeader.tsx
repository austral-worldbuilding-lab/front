import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "lucide-react";

interface MandalaPageHeaderProps {
  title: string;
  organizationId?: string;
  projectId?: string;
  children?: React.ReactNode;
}

/**
 * Componente de encabezado para las páginas de mandalas
 * Incluye título y botón de retorno
 */
const MandalaPageHeader: React.FC<MandalaPageHeaderProps> = ({
  title,
  organizationId,
  projectId,
  children,
}) => {
  return (
    <div className="w-full max-w-2xl px-4">
      {/* Botón de retorno */}
      <div className="absolute top-10 left-10">
        {organizationId && projectId ? (
          <Link
            to={`/app/organization/${organizationId}/projects/${projectId}`}
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
        ) : (
          <Link to="/app">
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
        )}
      </div>

      {/* Título */}
      <h1 className="text-2xl font-bold mb-2 text-center">{title}</h1>

      {/* Contenido adicional (banner informativo, etc) */}
      {children}
    </div>
  );
};

export default MandalaPageHeader;
