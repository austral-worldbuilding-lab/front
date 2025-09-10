// components/question-machine/filters/FiltersPanel.tsx
import ToggleBadge from "@/components/ui/toggle-badge";

export type BoolMap = Record<string, boolean>;

export interface FiltersState {
    sections: BoolMap;
    scales: BoolMap;
}

export interface FiltersPanelProps {
    sections: string[];
    scales: string[];
    value: FiltersState;
    onChange: (s: FiltersState) => void;
}

export default function FiltersPanel({ sections, scales, value, onChange }: FiltersPanelProps) {
    const toggle = (group: "sections" | "scales", key: string) => {
        onChange({
            ...value,
            [group]: { ...value[group], [key]: !value[group][key] },
        });
    };

    return (
        <div className="space-y-3">
            <div>
                <p className="text-sm font-medium mb-2">Secciones</p>
                <div className="flex gap-2 max-w-full overflow-x-auto custom-scrollbar pb-3 flex-nowrap">
                    {sections.map((s) => (
                        <div key={s} className="shrink-0">
                            <ToggleBadge
                                label={s}
                                isActive={!!value.sections[s]}
                                onToggle={() => toggle("sections", s)}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <p className="text-sm font-medium mb-2">Escalas</p>
                <div className="flex gap-2 max-w-full overflow-x-auto custom-scrollbar pb-3 flex-nowrap">
                    {scales.map((s) => (
                        <div key={s} className="shrink-0">
                            <ToggleBadge
                                label={s}
                                isActive={!!value.scales[s]}
                                onToggle={() => toggle("scales", s)}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
