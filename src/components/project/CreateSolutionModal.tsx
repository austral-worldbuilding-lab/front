import { useState } from "react";
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
import { BarChart2 } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from "@/components/ui/command";
import useProvocations from "@/hooks/useProvocations";
import type {Provocation, Solution} from "@/types/mandala";

interface CreateSolutionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreateSolution: (solution: Omit<Solution, "id">) => void;
    projectId: string;
}

export function CreateSolutionModal({
                                        open,
                                        onOpenChange,
                                        onCreateSolution,
                                        projectId,
                                    }: CreateSolutionModalProps) {
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

    const isFormValid =
        formData.title.trim() &&
        formData.description.trim() &&
        formData.problem.trim()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        onCreateSolution({
            title: formData.title,
            description: formData.description,
            problem: formData.problem,
            impact: {
                level: formData.impactLevel,
                description: formData.impactDescription,
            },
            provocations: selectedProvocations.map((p) => p.question),
        });

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
                    <DialogTitle>Crear Solución</DialogTitle>
                    <DialogDescription>
                        Define una nueva solución basada en tu análisis
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
                            <Label htmlFor="impactDescription">Descripción del impacto</Label>
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
                                                (p) => p.question === prov.question
                                            );
                                            return (
                                                <CommandItem
                                                    key={prov.id}
                                                    onSelect={() => {
                                                        if (isSelected) {
                                                            setSelectedProvocations(
                                                                selectedProvocations.filter(
                                                                    (p) => p.question !== prov.question
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
                            Crear Solución
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}