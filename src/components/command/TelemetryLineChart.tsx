import React from 'react';
import { TelemetryPoint } from '../../types/telemetry';

interface TelemetryLineChartProps {
  title: string;
  subtitle: string;
  unit: string;
  data: TelemetryPoint[];
  dataKey: 'temperature' | 'vibration';
  warnThreshold: number;
  critThreshold: number;
  accentColor: string;
  minDomain?: number;
  maxDomain?: number;
}

export const TelemetryLineChart: React.FC<TelemetryLineChartProps> = ({
  title,
  subtitle,
  unit,
  data,
  dataKey,
  warnThreshold,
  critThreshold,
  accentColor,
  minDomain,
  maxDomain,
}) => {
  const width = 500;
  const height = 165;
  const padLeft = 40;
  const padRight = 16;
  const padTop = 18;
  const padBottom = 24;

  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const values = data.map((d) => d[dataKey]);
  const currentVal = values[values.length - 1] ?? 0;
  const minVal = values.length > 0 ? Math.min(...values) : 0;
  const maxVal = values.length > 0 ? Math.max(...values) : 0;
  const avgVal =
    values.length > 0
      ? values.reduce((acc, v) => acc + v, 0) / values.length
      : 0;

  const rawMin = Math.min(...values, warnThreshold * 0.72);
  const rawMax = Math.max(...values, critThreshold * 1.08);

  const yMin = minDomain !== undefined ? minDomain : Math.floor(rawMin * 0.92);
  const yMax = maxDomain !== undefined ? maxDomain : Math.ceil(rawMax * 1.04);
  const yRange = Math.max(1, yMax - yMin);

  const toX = (idx: number) =>
    padLeft + (idx / Math.max(1, data.length - 1)) * plotW;
  const toY = (val: number) =>
    padTop + plotH - ((val - yMin) / yRange) * plotH;

  const pointsString = data
    .map((pt, i) => `${toX(i).toFixed(1)},${toY(pt[dataKey]).toFixed(1)}`)
    .join(' ');

  const areaPath =
    data.length > 1
      ? `M ${toX(0).toFixed(1)},${(padTop + plotH).toFixed(1)} L ` +
        data
          .map((pt, i) => `${toX(i).toFixed(1)},${toY(pt[dataKey]).toFixed(1)}`)
          .join(' L ') +
        ` L ${toX(data.length - 1).toFixed(1)},${(padTop + plotH).toFixed(1)} Z`
      : '';

  const warnY = toY(warnThreshold);
  const critY = toY(critThreshold);

  const isCrit = currentVal >= critThreshold;
  const isWarn = !isCrit && currentVal >= warnThreshold;

  const activeStroke = isCrit
    ? '#EF4444'
    : isWarn
    ? '#F59E0B'
    : accentColor;

  const gradientId = `chart-grad-${dataKey}-${title.replace(/\s+/g, '')}`;
  const decimals = dataKey === 'vibration' ? 2 : 1;

  return (
    <div className="rounded-xl surface-well p-4">
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div>
          <h4 className="font-sans font-semibold text-sm text-[#F0F3EA]">
            {title}
          </h4>
          <p className="text-xs text-[#A1ADA0]">{subtitle}</p>
        </div>
        <div className="text-right">
          <div
            className={`font-mono text-xl font-bold tabular-nums tracking-tight ${
              isCrit
                ? 'text-telemetry-crimson'
                : isWarn
                ? 'text-telemetry-amber'
                : 'text-[#F0F3EA]'
            }`}
          >
            {currentVal.toFixed(decimals)}{' '}
            <span className="text-xs font-normal text-[#A1ADA0]">{unit}</span>
          </div>
          <div className="text-[11px] font-mono text-[#A1ADA0] tabular-nums">
            Warn {warnThreshold} • Crit {critThreshold} {unit}
          </div>
        </div>
      </div>

      {/* Min / Avg / Max Live Telemetry Strip */}
      <div className="flex items-center gap-4 text-[11px] font-mono text-[#A1ADA0] mb-2 pb-2 border-b border-white/[0.05] tabular-nums">
        <span>
          MIN: <strong className="text-[#F0F3EA]">{minVal.toFixed(decimals)}</strong>
        </span>
        <span>
          AVG: <strong className="text-[#F0F3EA]">{avgVal.toFixed(decimals)}</strong>
        </span>
        <span>
          PEAK: <strong className="text-[#F0F3EA]">{maxVal.toFixed(decimals)}</strong>
        </span>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-36 overflow-visible select-none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={activeStroke} stopOpacity="0.22" />
            <stop offset="100%" stopColor={activeStroke} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal Reference Grid Lines */}
        {[0, 0.5, 1].map((frac, idx) => {
          const yVal = yMin + yRange * (1 - frac);
          const yPos = padTop + plotH * frac;
          return (
            <g key={idx}>
              <line
                x1={padLeft}
                y1={yPos}
                x2={width - padRight}
                y2={yPos}
                stroke="rgba(194, 214, 168, 0.08)"
                strokeWidth="1"
              />
              <text
                x={padLeft - 8}
                y={yPos + 3}
                textAnchor="end"
                className="fill-[#A1ADA0] text-[10px] font-mono"
              >
                {yVal.toFixed(dataKey === 'vibration' ? 1 : 0)}
              </text>
            </g>
          );
        })}

        {/* Warning Threshold Line */}
        {warnY >= padTop && warnY <= padTop + plotH && (
          <g>
            <line
              x1={padLeft}
              y1={warnY}
              x2={width - padRight}
              y2={warnY}
              stroke="#F59E0B"
              strokeWidth="1.2"
              strokeDasharray="4 4"
            />
            <rect
              x={width - padRight - 36}
              y={warnY - 13}
              width="34"
              height="11"
              rx="2"
              fill="#0C1210"
            />
            <text
              x={width - padRight - 4}
              y={warnY - 4}
              textAnchor="end"
              className="fill-amber-400 text-[9px] font-mono font-semibold"
            >
              WARN
            </text>
          </g>
        )}

        {/* Critical Threshold Line */}
        {critY >= padTop && critY <= padTop + plotH && (
          <g>
            <line
              x1={padLeft}
              y1={critY}
              x2={width - padRight}
              y2={critY}
              stroke="#EF4444"
              strokeWidth="1.2"
              strokeDasharray="4 4"
            />
            <rect
              x={width - padRight - 32}
              y={critY - 13}
              width="30"
              height="11"
              rx="2"
              fill="#0C1210"
            />
            <text
              x={width - padRight - 4}
              y={critY - 4}
              textAnchor="end"
              className="fill-red-400 text-[9px] font-mono font-semibold"
            >
              CRIT
            </text>
          </g>
        )}

        {/* Subtle Shaded Area */}
        {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} />}

        {/* Clean Telemetry Waveform Line */}
        {data.length > 1 && (
          <polyline
            fill="none"
            stroke={activeStroke}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={pointsString}
          />
        )}

        {/* Latest Data Point Marker */}
        {data.length > 0 && (
          <g>
            <circle
              cx={toX(data.length - 1)}
              cy={toY(currentVal)}
              r="5"
              fill={activeStroke}
              fillOpacity="0.25"
            />
            <circle
              cx={toX(data.length - 1)}
              cy={toY(currentVal)}
              r="3"
              fill={activeStroke}
            />
          </g>
        )}

        {/* X-Axis Timestamps */}
        {data.length > 2 && (
          <>
            <text
              x={padLeft}
              y={height - 5}
              textAnchor="start"
              className="fill-[#A1ADA0] text-[10px] font-mono"
            >
              {data[0].timestamp}
            </text>
            <text
              x={padLeft + plotW / 2}
              y={height - 5}
              textAnchor="middle"
              className="fill-[#A1ADA0] text-[10px] font-mono"
            >
              {data[Math.floor(data.length / 2)].timestamp}
            </text>
            <text
              x={width - padRight}
              y={height - 5}
              textAnchor="end"
              className="fill-[#F0F3EA] text-[10px] font-mono"
            >
              {data[data.length - 1].timestamp}
            </text>
          </>
        )}
      </svg>
    </div>
  );
};
