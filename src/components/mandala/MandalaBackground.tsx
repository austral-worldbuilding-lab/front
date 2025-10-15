import { Mandala } from "@/types/mandala";
import MandalaConcentric from "./MandalaConcentric";
import MandalaPerson from "./MandalaPerson";
import MandalaSectors from "./MandalaSectors";
import { Levels, Sectors } from "@/constants/mandala";

export const MandalaBackground: React.FC<{
  mandala: Mandala;
  offsetX: number;
  offsetY: number;
  scale: number;
}> = ({ mandala, offsetX, offsetY, scale }) => {
  const config = mandala.mandala.configuration;
  const scaleCount = config?.scales?.length || 1;
  const maxRadius = 150 * scaleCount;

  function getInterpolatedLevelColor(index: number, total: number): string {
    const from = [200, 220, 255, 0.9];
    const to = [140, 190, 255, 0.3];
    const t = total > 1 ? index / (total - 1) : 0;
    const interpolated = from.map((start, i) => start + (to[i] - start) * t);
    const [r, g, b, a] = interpolated;
    return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(
      b
    )}, ${a.toFixed(2)})`;
  }

  const levels =
    config?.scales?.map((name, index) => {
      return {
        id: `level-${index}`,
        name,
        radius: 150 * (index + 1),
        color: getInterpolatedLevelColor(index, scaleCount),
      };
    }) ?? Levels;

  const sectors =
    config?.dimensions?.map((dimension, index) => ({
      id: `sector-${index}`,
      name: dimension.name,
      question: `¿Qué pasa en ${dimension.name}?`,
      color: dimension.color,
    })) ?? Sectors;

  return (
    <div
      className="absolute"
      style={{
        left: offsetX,
        top: offsetY,
        width: maxRadius * 2,
        height: maxRadius * 2,
        transform: `scale(${scale})`,
        transformOrigin: "center",
      }}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <MandalaConcentric levels={levels} />
          <MandalaPerson type={mandala.mandala.type} />
          <MandalaSectors
            sectors={sectors}
            maxRadius={maxRadius}
            levels={levels}
          />
        </div>
      </div>
    </div>
  );
};
