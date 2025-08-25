import React from "react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  parseMandalaHistory,
  buildMandalaHistoryQuery,
} from "@/utils/mandalaHistory";

const BreadcrumbMandala: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { organizationId, projectId } = useParams();
  const { ids, names } = parseMandalaHistory(location.search);

  if (ids.length === 0) return null;

  const handleNavigate = (idx: number) => {
    const newIds = ids.slice(0, idx + 1);
    const newNames = names.slice(0, idx + 1);
    const search = buildMandalaHistoryQuery(newIds, newNames);
    navigate(
      `/app/organization/${organizationId}/projects/${projectId}/mandala/${
        newIds[newIds.length - 1]
      }?${search}`
    );
  };

  return (
    <Breadcrumb className="mt-4 mx-4 h-8 flex items-center">
      <BreadcrumbList>
        {ids.length <= 3 ? (
          ids.map((id, idx) => (
            <React.Fragment key={id}>
              <BreadcrumbItem>
                {idx === ids.length - 1 ? (
                  <BreadcrumbPage>{names[idx]}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <button
                      className="hover:text-foreground underline transition-colors cursor-pointer"
                      onClick={() => handleNavigate(idx)}
                    >
                      {names[idx]}
                    </button>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {idx < ids.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))
        ) : (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <button
                  className="hover:text-foreground transition-colors"
                  onClick={() => handleNavigate(0)}
                >
                  {names[0]}
                </button>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbEllipsis />
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <button
                  className="hover:text-foreground transition-colors"
                  onClick={() => handleNavigate(ids.length - 2)}
                >
                  {names[ids.length - 2]}
                </button>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{names[ids.length - 1]}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default BreadcrumbMandala;
