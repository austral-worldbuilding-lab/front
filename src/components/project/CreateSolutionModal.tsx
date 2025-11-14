import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { BarChart2, Plus, Trash2 } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from "@/components/ui/command";
import useProvocations from "@/hooks/useProvocations";
import type { Provocation, Solution, ActionItem } from "@/types/mandala";

interface CreateSolutionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreateSolution?: (solution: Omit<Solution, "id">) => void;
    onUpdateSolution?: (solutionId: string, solution: Partial<Omit<Solution, "id">>) => void;
    projectId: string;
    editingSolution?: Solution | null;
}

export function CreateSolutionModal({
                                        open,
                                        onOpenChange,
                                        onCreateSolution,
                                        onUpdateSolution,
                                        projectId,
                                        editingSolution,
                                    }: CreateSolutionModalProps) {
    const isEditMode = !!editingSolution;

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        problem: "",
        impactDescription: "",
        impactLevel: "medium" as "low" | "medium" | "high",
    });

    const { provocations, reload } = useProvocations(projectId);
    const [selectedProvocations, setSelectedProvocations] = useState<Provocation[]>([]);
    const [openProvocations, setOpenProvocations] = useState(false);
    const [actionItems, setActionItems] = useState<ActionItem[]>([]);

    useEffect(() => {
        if (editingSolution && open) {
            setFormData({
                title: editingSolution.title || "",
                description: editingSolution.description || "",
                problem: editingSolution.problem || "",
                impactDescription: editingSolution.impact?.description || "",
                impactLevel: (editingSolution.impact?.level?.toLowerCase() as "low" | "medium" | "high") || "medium",
            });

            if (editingSolution.provocations && provocations.length > 0) {
                const matchedProvocations = provocations.filter(p =>
                    editingSolution.provocations?.includes(p.question)
                );
                setSelectedProvocations(matchedProvocations);
            }

            setActionItems(editingSolution.actionItems || []);
        } else if (!editingSolution && open) {
            resetForm();
        }
    }, [editingSolution, open, provocations]);

    const areActionItemsValid = () => {
        if (!isEditMode || actionItems.length === 0) return true;

        return actionItems.every(item =>
            item.title.trim() !== "" &&
            item.description.trim() !== ""
        );
    };

    const isFormValid =
        formData.title.trim() &&
        formData.description.trim() &&
        formData.problem.trim() &&
        formData.impactDescription.trim() &&
        areActionItemsValid();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        const solutionData = {
            title: formData.title,
            description: formData.description,
            problem: formData.problem,
            impact: {
                level: formData.impactLevel,
                description: formData.impactDescription,
            },
            provocationIds: selectedProvocations.map((p) => p.id),
            ...(isEditMode && { actionItems }),
        };

        if (isEditMode && editingSolution && onUpdateSolution) {
            await onUpdateSolution(editingSolution.id, solutionData);
        } else if (onCreateSolution) {
            onCreateSolution(solutionData);
        }

        resetForm();
        onOpenChange(false);
    };

    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            problem: "",
            impactDescription: "",
            impactLevel: "medium",
        });
        setSelectedProvocations([]);
        setActionItems([]);
    };

    const addActionItem = () => {
        const newOrder = actionItems.length > 0
            ? Math.max(...actionItems.map(item => item.order)) + 1
            : 1;

        setActionItems([
            ...actionItems,
            {
                order: newOrder,
                title: "",
                description: "",
                duration: "",
            },
        ]);
    };

    const removeActionItem = (order: number) => {
        setActionItems(actionItems.filter((item) => item.order !== order));
    };

    const updateActionItem = (order: number, field: keyof ActionItem, value: string | number) => {
        setActionItems(
            actionItems.map((item) =>
                item.order === order ? { ...item, [field]: value } : item
            )
        );
    };

    const impactColors: Record<"low" | "medium" | "high", string> = {
        low: "#34D399",
        medium: "#FBBF24",
        high: "#EF4444",
    };
    const iconColor = impactColors[formData.impactLevel];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditMode ? "Editar Solución" : "Crear Solución"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? "Modifica los detalles de la solución"
                            : "Define una nueva solución basada en tu análisis"}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Título</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Nombre de la solución"
                            className="h-10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe la solución en detalle"
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="problem">Problema que resuelve</Label>
                        <Textarea
                            id="problem"
                            value={formData.problem}
                            onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                            placeholder="¿Qué problema específico aborda esta solución?"
                            rows={2}
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="space-y-2 flex-1">
                                <Label htmlFor="impactLevel">Nivel de Impacto</Label>
                                <Select
                                    value={formData.impactLevel}
                                    onValueChange={(value: "low" | "medium" | "high") =>
                                        setFormData({ ...formData, impactLevel: value })
                                    }
                                >
                                    <SelectTrigger className="h-10 px-3 w-full text-sm">
                                        <SelectValue placeholder="Selecciona nivel" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border rounded-md shadow-md">
                                        <SelectItem value="low">Bajo</SelectItem>
                                        <SelectItem value="medium">Medio</SelectItem>
                                        <SelectItem value="high">Alto</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <BarChart2 className="w-5 h-5 mt-7" style={{ color: iconColor }} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="impactDescription">
                                Descripción del impacto
                            </Label>
                            <Input
                                id="impactDescription"
                                value={formData.impactDescription}
                                onChange={(e) =>
                                    setFormData({ ...formData, impactDescription: e.target.value })
                                }
                                placeholder="Ej: Reducción del 40% en residuos"
                                className="h-10 w-full px-3 text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Provocaciones</Label>
                        <Popover
                            open={openProvocations}
                            onOpenChange={(open) => {
                                setOpenProvocations(open);
                                if (open && provocations.length === 0) reload();
                            }}
                        >
                            <PopoverTrigger asChild>
                                <button
                                    type="button"
                                    className="w-full cursor-pointer border rounded-md h-10 flex items-center px-3 text-left text-sm bg-white hover:bg-gray-50"
                                >
                                    <span className="text-gray-500">
                                        {selectedProvocations.length > 0
                                            ? `${selectedProvocations.length} seleccionadas`
                                            : "Selecciona provocaciones que estén asociadas a la solución"}
                                    </span>
                                </button>
                            </PopoverTrigger>

                            <PopoverContent className="w-full p-0 max-h-60 overflow-y-auto">
                                <Command>
                                    <CommandInput placeholder="Buscar provocación..." />
                                    <CommandList>
                                        <CommandEmpty>No hay provocaciones.</CommandEmpty>
                                        {provocations.map((prov) => {
                                            const isSelected = selectedProvocations.some(
                                                (p) => p.id === prov.id
                                            );
                                            return (
                                                <CommandItem
                                                    key={prov.id}
                                                    onSelect={() => {
                                                        if (isSelected) {
                                                            setSelectedProvocations(
                                                                selectedProvocations.filter(
                                                                    (p) => p.id !== prov.id
                                                                )
                                                            );
                                                        } else {
                                                            setSelectedProvocations([...selectedProvocations, prov]);
                                                        }
                                                    }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        readOnly
                                                        className="mr-2"
                                                    />
                                                    <span className="break-words text-sm">{prov.question}</span>
                                                </CommandItem>
                                            );
                                        })}
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {isEditMode && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label>Plan de Acción</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addActionItem}
                                    className="gap-2"
                                >
                                    <Plus size={16} /> Agregar paso
                                </Button>
                            </div>

                            {actionItems.length > 0 && (
                                <div className="space-y-3">
                                    {actionItems
                                        .sort((a, b) => a.order - b.order)
                                        .map((item) => (
                                            <div
                                                key={item.order}
                                                className="border rounded-lg p-4 space-y-3 bg-gray-50"
                                            >
                                                <div className="flex items-start gap-2">
                                                    <div className="w-6 h-6 flex items-center justify-center bg-primary text-white rounded-full text-sm font-semibold flex-shrink-0 mt-1">
                                                        {item.order}
                                                    </div>
                                                    <div className="flex-1 space-y-3">
                                                        <Input
                                                            value={item.title}
                                                            onChange={(e) =>
                                                                updateActionItem(item.order, "title", e.target.value)
                                                            }
                                                            placeholder="Título del paso *"
                                                            className="h-9"
                                                        />
                                                        <Textarea
                                                            value={item.description}
                                                            onChange={(e) =>
                                                                updateActionItem(item.order, "description", e.target.value)
                                                            }
                                                            placeholder="Descripción *"
                                                            rows={2}
                                                        />
                                                        <Input
                                                            value={item.duration || ""}
                                                            onChange={(e) =>
                                                                updateActionItem(item.order, "duration", e.target.value)
                                                            }
                                                            placeholder="Duración (opcional - ej: 2 semanas)"
                                                            className="h-9"
                                                        />
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeActionItem(item.order)}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                resetForm();
                                onOpenChange(false);
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={!isFormValid}>
                            {isEditMode ? "Guardar Cambios" : "Crear Solución"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}