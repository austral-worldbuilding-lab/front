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
import { useNavigate } from "react-router-dom";

const BreadcrumbMandala: React.FC = () => {
    const { history } = useMandalaHistory();
    const navigate = useNavigate();

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {history.length <= 3
                    ? history.map((item, idx) => (
                        <React.Fragment key={item.id}>
                            <BreadcrumbItem>
                                {idx === history.length - 1 ? (
                                    <BreadcrumbPage>{item.name}</BreadcrumbPage>
                                ) : (
                                    <button
                                        className="hover:text-foreground transition-colors"
                                        onClick={() =>
                                            navigate(`/mandala/${item.id}`, {
                                                state: { fromMandala: true },
                                            })
                                        }
                                    >
                                        {item.name}
                                    </button>
                                )}
                            </BreadcrumbItem>
                            {idx < history.length - 1 && <BreadcrumbSeparator />}
                        </React.Fragment>
                    ))
                    : (
                        <>
                            <BreadcrumbItem>
                                <button
                                    className="hover:text-foreground transition-colors"
                                    onClick={() =>
                                        navigate(`/mandala/${history[0].id}`, {
                                            state: { fromMandala: true },
                                        })
                                    }
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
                                    onClick={() =>
                                        navigate(`/mandala/${history[history.length - 2].id}`, {
                                            state: { fromMandala: true },
                                        })
                                    }
                                >
                                    {history[history.length - 2].name}
                                </button>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>
                                    {history[history.length - 1].name}
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </>
                    )}
            </BreadcrumbList>
        </Breadcrumb>
    );
};

export default BreadcrumbMandala;
