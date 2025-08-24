import React from "react";
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbPage,
    BreadcrumbSeparator,
    BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb";
import { useMandalaHistory } from "@/hooks/useMandalaHistory";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const BreadcrumbMandala: React.FC = () => {
    const { history } = useMandalaHistory();
    const navigate = useNavigate();
    const { search } = useLocation();
    const { organizationId, projectId } = useParams<{
        organizationId: string;
        projectId: string;
    }>();

    // Si no hay "anterior", ocultamos el breadcrumb (criterio de aceptación).
    if (history.length <= 1) return null;

    const basePath = `/app/organization/${organizationId}/projects/${projectId}/mandala`;
    const lastIdx = history.length - 1;

    const go = (mandalaId: string) =>
        navigate({ pathname: `${basePath}/${mandalaId}`, search }, { state: { fromMandala: true } });

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {history.length <= 3 ? (
                    history.map((item, idx) => (
                        <React.Fragment key={item.id}>
                            <BreadcrumbItem>
                                {idx === lastIdx ? (
                                    <BreadcrumbPage>{item.name}</BreadcrumbPage>
                                ) : (
                                    <button
                                        className="hover:text-foreground transition-colors"
                                        onClick={() => go(item.id)}
                                    >
                                        {item.name}
                                    </button>
                                )}
                            </BreadcrumbItem>
                            {idx < lastIdx && <BreadcrumbSeparator />}
                        </React.Fragment>
                    ))
                ) : (
                    <>
                        <BreadcrumbItem>
                            <button
                                className="hover:text-foreground transition-colors"
                                onClick={() => go(history[0].id)}
                            >
                                {history[0].name}
                            </button>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbEllipsis />
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <button
                                className="hover:text-foreground transition-colors"
                                onClick={() => go(history[lastIdx - 1].id)}
                            >
                                {history[lastIdx - 1].name}
                            </button>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{history[lastIdx].name}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </>
                )}
            </BreadcrumbList>
        </Breadcrumb>
    );
};

export default BreadcrumbMandala;
