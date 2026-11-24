import { useId, useState } from "react";
import { taka } from "@/lib/format";

export const PALETTE = ["#2456c7", "#16a34a", "#f59e0b", "#7c3aed", "#0ea5e9", "#94a3b8"];

// Small bar sparkline for the period cards.
export function SparkBars({ values = [], color = "#2456c7", className = "h-8 w-24" }) {
  const max = Math.max(...values, 1);
  const width = 100 / Math.max(values.length, 1);
  return (
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" className={className}>
      {values.map((value, index) => {
        const height = value > 0 ? Math.max(3, (value / max) * 32) : 1.5;
        return <rect key={index} x={index * width + width * 0.2} y={32 - height} width={width * 0.6} height={height} rx="1" fill={color} opacity={value > 0 ? 1 : 0.25} />;
      })}
    </svg>
  );
}

// Smooth area chart with labels on the points.
export function AreaChart({ points = [], height = 260 }) {
  const id = useId();
  const [hover, setHover] = useState(null);
  const width = 640;
  const pad = { top: 28, right: 20, bottom: 28, left: 44 };
  const max = Math.max(...points.map((point) => point.value), 1) * 1.15;
  const x = (index) => pad.left + (index * (width - pad.left - pad.right)) / Math.max(points.length - 1, 1);
  const y = (value) => pad.top + (height - pad.top - pad.bottom) * (1 - value / max);
  const coords = points.map((point, index) => [x(index), y(point.value)]);
  const line = coords.reduce((path, [px, py], index) => {
    if (!index) return `M${px},${py}`;
    const [qx, qy] = coords[index - 1];
    const mid = (px + qx) / 2;
    return `${path} C${mid},${qy} ${mid},${py} ${px},${py}`;
  }, "");
  const area = coords.length ? `${line} L${coords.at(-1)[0]},${height - pad.bottom} L${coords[0][0]},${height - pad.bottom} Z` : "";
  const best = points.reduce((top, point, index) => (point.value > (points[top]?.value ?? -1) ? index : top), 0);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((step) => Math.round((max / 1.15) * step));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" onMouseLeave={() => setHover(null)}>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#2456c7" stopOpacity=".28" />
          <stop offset="1" stopColor="#2456c7" stopOpacity="0" />
        </linearGradient>
      </defs>
      {ticks.map((tick) => (
        <g key={tick}>
          <line x1={pad.left} x2={width - pad.right} y1={y(tick)} y2={y(tick)} stroke="#eef2f7" />
          <text x={pad.left - 8} y={y(tick) + 3} textAnchor="end" className="fill-slate-400 text-[10px]">৳{tick}</text>
        </g>
      ))}
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke="#2456c7" strokeWidth="2.5" />
      {coords.map(([px, py], index) => (
        <g key={index} onMouseEnter={() => setHover(index)} onClick={() => setHover(index)}>
          <rect x={px - 20} y={pad.top} width="40" height={height - pad.top - pad.bottom} fill="transparent" />
          <circle cx={px} cy={py} r={index === best || index === hover ? 4.5 : 3} fill="#fff" stroke="#2456c7" strokeWidth="2" />
          {(index === best || index === hover) && points[index].value > 0 && (
            <g>
              <rect x={px - 24} y={py - 26} width="48" height="18" rx="5" fill="#13265c" />
              <text x={px} y={py - 13} textAnchor="middle" className="fill-white text-[10px] font-bold">{taka(points[index].value)}</text>
            </g>
          )}
          <text x={px} y={height - 8} textAnchor="middle" className="fill-slate-400 text-[10px]">{points[index].label}</text>
        </g>
      ))}
    </svg>
  );
}

// Donut chart; segments = [{ value, color }]. Zero values are skipped; hover highlights one part.
export function Donut({ segments = [], size = 190, stroke = 22, active = -1, onHover, children }) {
  const radius = (size - stroke) / 2 - 4;
  const length = 2 * Math.PI * radius;
  const total = segments.reduce((sum, item) => sum + Math.max(0, item.value), 0);
  const gap = segments.filter((item) => item.value > 0).length > 1 ? 3 : 0;
  let offset = 0;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }} onMouseLeave={() => onHover?.(-1)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#eef2f7" strokeWidth={stroke} />
        {total > 0 && segments.map((item, index) => {
          if (!(item.value > 0)) return null;
          const part = (item.value / total) * length;
          const circle = <circle key={index} cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={item.color} strokeWidth={active === index ? stroke + 6 : stroke} strokeDasharray={`${Math.max(part - gap, 0.5)} ${length}`} strokeDashoffset={-offset} opacity={active >= 0 && active !== index ? 0.35 : 1} className="cursor-pointer transition-all duration-200" onMouseEnter={() => onHover?.(index)} />;
          offset += part;
          return circle;
        })}
      </svg>
      <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}
