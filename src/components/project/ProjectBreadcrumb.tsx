import { useProjectBreadcrumb } from "@/hooks/useProjectBreadcrumb";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { useNavigate, useParams } from "react-router-dom";

export const ProjectBreadcrumb = ({
  organizationName,
  projectName,
}: {
  organizationName?: string;
  projectName?: string;
}) => {
  const { stack, pop, clear } = useProjectBreadcrumb();
  const { organizationId } = useParams();
  const navigate = useNavigate();

  if (!organizationName || !projectName) {
    return;
  }

  return (
    <div className="mb-2 overflow-x-auto custom-scrollbar">
      <Breadcrumb className="flex-nowrap min-w-max">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              asChild
              onClick={() => {
                clear();
                navigate(`/app/organization/${organizationId}/projects`);
              }}
            >
              <span className="hover:cursor-pointer">{organizationName}</span>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {stack.map((item, index) => (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink
                  asChild
                  onClick={() => {
                    pop(stack.length - index);
                    navigate(`${item.url}`);
                  }}
                >
                  <span className="hover:cursor-pointer">{item.title}</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          ))}
          <BreadcrumbItem>
            <BreadcrumbPage>{projectName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};
