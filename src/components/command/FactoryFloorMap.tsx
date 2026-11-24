import React from 'react';
import { MachineId, MachineStatus, MachineTelemetry } from '../../types/telemetry';

interface FactoryFloorMapProps {
  machines: MachineTelemetry[];
  selectedMachineId: MachineId;
  onSelectMachine: (id: MachineId) => void;
}

const getStatusHex = (status: MachineStatus) => {
  switch (status) {
    case 'RUNNING':
      return '#10B981'; // Emerald
    case 'WARNING':
      return '#F59E0B'; // Amber
    case 'CRITICAL':
      return '#EF4444'; // Crimson
  }
};

/**
 * Renders a recognizable technical machine silhouette inside each SVG workcell
 * based on machine ID (Conveyor, Pump, CNC Mill, 6-DOF Robot Arm, Hydraulic Press, Chiller).
 */
const renderMachineEquipmentGlyph = (id: MachineId, strokeColor: string) => {
  switch (id) {
    case 'M-01': // Conveyor Motor & Rollers
      return (
        <g stroke={strokeColor} strokeWidth="1.6" fill="none" opacity="0.9">
          <rect x="-26" y="-12" width="52" height="24" rx="12" />
          <circle cx="-14" cy="0" r="5.5" />
          <circle cx="0" cy="0" r="5.5" />
          <circle cx="14" cy="0" r="5.5" />
        </g>
      );
    case 'M-02': // Industrial Centrifugal Pump & Impeller
      return (
        <g stroke={strokeColor} strokeWidth="1.6" fill="none" opacity="0.9">
          <circle cx="0" cy="2" r="14" />
          <circle cx="0" cy="2" r="5" />
          <path d="M 0 -12 L 18 -12 L 18 -4 L 12 -4" />
          <path d="M -10 -8 L 10 12 M -10 12 L 10 -8" strokeOpacity="0.5" />
        </g>
      );
    case 'M-03': // 5-Axis CNC Gantry & Spindle
      return (
        <g stroke={strokeColor} strokeWidth="1.6" fill="none" opacity="0.9">
          <rect x="-22" y="-14" width="44" height="28" rx="3" />
          <line x1="-22" y1="-4" x2="22" y2="-4" />
          <rect x="-5" y="-11" width="10" height="14" fill="#101816" />
          <line x1="0" y1="3" x2="0" y2="9" strokeWidth="2" />
          <line x1="-12" y1="10" x2="12" y2="10" strokeWidth="2" />
        </g>
      );
    case 'M-04': // 6-DOF Articulated Robotic Arm
      return (
        <g stroke={strokeColor} strokeWidth="1.7" fill="none" opacity="0.95">
          <path d="M -16 12 L 16 12" strokeWidth="2.5" />
          <circle cx="-6" cy="8" r="4" fill="#101816" />
          <path d="M -6 4 L 4 -8 L 14 -4" />
          <circle cx="4" cy="-8" r="3" fill="#101816" />
          <path d="M 14 -7 L 18 -9 M 14 -1 L 18 -1" />
        </g>
      );
    case 'M-05': // 800-Ton Heavy Hydraulic Stamping Press
      return (
        <g stroke={strokeColor} strokeWidth="1.6" fill="none" opacity="0.9">
          <rect x="-20" y="-15" width="40" height="30" rx="2" />
          <rect x="-12" y="-15" width="24" height="9" />
          <line x1="-6" y1="-6" x2="-6" y2="3" strokeWidth="2" />
          <line x1="6" y1="-6" x2="6" y2="3" strokeWidth="2" />
          <rect x="-14" y="3" width="28" height="5" />
        </g>
      );
    case 'M-06': // Dual-Fan Adiabatic Cooling Chiller
      return (
        <g stroke={strokeColor} strokeWidth="1.6" fill="none" opacity="0.9">
          <rect x="-24" y="-13" width="48" height="26" rx="4" />
          <circle cx="-11" cy="0" r="8" />
          <circle cx="11" cy="0" r="8" />
          <line x1="-11" y1="-8" x2="-11" y2="8" strokeOpacity="0.5" />
          <line x1="-19" y1="0" x2="-3" y2="0" strokeOpacity="0.5" />
          <line x1="11" y1="-8" x2="11" y2="8" strokeOpacity="0.5" />
          <line x1="3" y1="0" x2="19" y2="0" strokeOpacity="0.5" />
        </g>
      );
  }
};

export const FactoryFloorMap: React.FC<FactoryFloorMapProps> = ({
  machines,
  selectedMachineId,
  onSelectMachine,
}) => {
  return (
    <div className="rounded-2xl surface-obsidian overflow-hidden flex flex-col h-full">
      {/* Header Bar */}
      <div className="px-5 py-3.5 bg-gradient-to-r from-[#151F19]/85 via-[#111A15]/85 to-[#151F19]/85 border-b border-white/[0.07] flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="font-sans font-semibold text-base text-[#F0F3EA]">
              Spatial Digital Factory Topology
            </h2>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-[#7EA46C]/20 text-[#C2D6A8] border border-[#7EA46C]/40">
              LIVE CAD TWIN
            </span>
          </div>
          <p className="text-xs text-[#A1ADA0] mt-0.5">
            Interactive plant schematic — click any workcell bay (M-01 to M-06) to inspect live waveforms
          </p>
        </div>

        {/* Status Legend */}
        <div className="flex items-center gap-4 text-xs bg-[#0C1210] px-3 py-1.5 rounded-lg border border-white/[0.06]">
          <span className="flex items-center gap-1.5 text-[#F0F3EA]">
            <span className="w-2 h-2 rounded-full bg-telemetry-emerald shadow-[0_0_8px_#10B981]" />
            Nominal
          </span>
          <span className="flex items-center gap-1.5 text-[#F0F3EA]">
            <span className="w-2 h-2 rounded-full bg-telemetry-amber shadow-[0_0_8px_#F59E0B]" />
            Warning
          </span>
          <span className="flex items-center gap-1.5 text-[#F0F3EA]">
            <span className="w-2 h-2 rounded-full bg-telemetry-crimson animate-pulse" />
            Critical
          </span>
          <span className="flex items-center gap-1.5 text-[#C2D6A8]">
            <span className="w-2.5 h-2.5 rounded-sm border-2 border-[#7EA46C]" />
            Focused
          </span>
        </div>
      </div>

      {/* Architectural CAD-style SVG Floor Canvas */}
      <div className="bg-[#040208] p-3 sm:p-4 flex-1 flex items-center">
        <svg
          viewBox="0 0 920 440"
          className="w-full h-auto min-h-[260px] select-none"
          role="img"
          aria-label="Digital Factory Floor Layout with 6 Workcells"
        >
          <defs>
            <pattern
              id="cadSubGrid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="#120E1E"
                strokeWidth="0.75"
              />
            </pattern>
            <pattern
              id="cadMajorGrid"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <rect width="100" height="100" fill="url(#cadSubGrid)" />
              <path
                d="M 100 0 L 0 0 0 100"
                fill="none"
                stroke="#253129"
                strokeWidth="1"
              />
            </pattern>
            <radialGradient id="selectedCellGlow" cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor="#7EA46C" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#7EA46C" stopOpacity="0.0" />
            </radialGradient>
          </defs>

          {/* Architectural Grid Backdrop */}
          <rect width="920" height="440" fill="url(#cadMajorGrid)" rx="10" />

          {/* NORTH PRODUCTION LINE A BAY ENCLOSURE */}
          <g>
            <rect
              x="24"
              y="18"
              width="872"
              height="174"
              rx="10"
              fill="#101813"
              fillOpacity="0.88"
              stroke="#2B382F"
              strokeWidth="1.2"
            />
            <rect
              x="24"
              y="18"
              width="872"
              height="26"
              rx="10"
              fill="#18221B"
            />
            <text
              x="38"
              y="35"
              className="fill-[#C2D6A8] text-[10px] font-mono font-semibold tracking-wider"
            >
              LINE A — INBOUND DRIVE, HIGH-PRESSURE COOLANT &amp; 5-AXIS CNC MACHINING
            </text>
            <text
              x="880"
              y="35"
              textAnchor="end"
              className="fill-[#A1ADA0] text-[10px] font-mono"
            >
              BAYS A-01 → A-03
            </text>
          </g>

          {/* CENTRAL AGV & TELEMETRY CORRIDOR */}
          <g>
            <line
              x1="24"
              y1="216"
              x2="896"
              y2="216"
              stroke="#2C2344"
              strokeWidth="1.5"
              strokeDasharray="8 6"
            />
            <rect
              x="350"
              y="205"
              width="220"
              height="22"
              rx="6"
              fill="#07050E"
              stroke="#2B382F"
            />
            <text
              x="460"
              y="219"
              textAnchor="middle"
              className="fill-[#A1ADA0] text-[9px] font-mono tracking-widest"
            >
              TELEMETRY BUS &amp; AGV CORRIDOR
            </text>
          </g>

          {/* SOUTH PRODUCTION LINE B BAY ENCLOSURE */}
          <g>
            <rect
              x="24"
              y="240"
              width="872"
              height="182"
              rx="10"
              fill="#101813"
              fillOpacity="0.88"
              stroke="#2B382F"
              strokeWidth="1.2"
            />
            <rect
              x="24"
              y="240"
              width="872"
              height="26"
              rx="10"
              fill="#18221B"
            />
            <text
              x="38"
              y="257"
              className="fill-[#C2D6A8] text-[10px] font-mono font-semibold tracking-wider"
            >
              LINE B — ROBOTIC MANIPULATION, 800T HYDRAULIC STAMPING &amp; THERMAL CHILLER LOOP
            </text>
            <text
              x="880"
              y="257"
              textAnchor="end"
              className="fill-[#A1ADA0] text-[10px] font-mono"
            >
              BAYS B-01 → B-03
            </text>
          </g>

          {/* BASE PROCESS CONDUITS + ANIMATED LIVE STREAM PULSES */}
          <g stroke="#2A362D" strokeWidth="5" fill="none">
            <line x1="280" y1="118" x2="345" y2="118" />
            <line x1="575" y1="118" x2="640" y2="118" />
            <line x1="280" y1="342" x2="345" y2="342" />
            <line x1="575" y1="342" x2="640" y2="342" />
          </g>
          <g
            stroke="#7EA46C"
            strokeWidth="2"
            strokeDasharray="6 6"
            fill="none"
            className="animate-conduit-flow"
          >
            <line x1="280" y1="118" x2="345" y2="118" />
            <line x1="575" y1="118" x2="640" y2="118" />
            <line x1="280" y1="342" x2="345" y2="342" />
            <line x1="575" y1="342" x2="640" y2="342" />
            <line x1="460" y1="176" x2="460" y2="284" />
            <line x1="755" y1="176" x2="755" y2="284" />
          </g>

          {/* 6 ARCHITECTURAL WORKCELL NODES */}
          {machines.map((m, idx) => {
            const isSelected = m.id === selectedMachineId;
            const statusColor = getStatusHex(m.status);
            const colIndex = idx % 3;
            const rowIndex = idx < 3 ? 0 : 1;
            const cx = 165 + colIndex * 295;
            const cy = rowIndex === 0 ? 118 : 342;

            return (
              <g
                key={m.id}
                onClick={() => onSelectMachine(m.id)}
                className="cursor-pointer"
                transform={`translate(${cx}, ${cy})`}
              >
                {/* Radial Atmosphere Under Selected Cell */}
                {isSelected && (
                  <rect
                    x="-132"
                    y="-66"
                    width="264"
                    height="132"
                    rx="16"
                    fill="url(#selectedCellGlow)"
                  />
                )}

                {/* Selected Workcell Outer Focus Frame */}
                {isSelected && (
                  <rect
                    x="-121"
                    y="-57"
                    width="242"
                    height="114"
                    rx="12"
                    fill="none"
                    stroke="#7EA46C"
                    strokeWidth="2"
                  />
                )}

                {/* Critical Alert Outer Perimeter Ring */}
                {m.status === 'CRITICAL' && !isSelected && (
                  <rect
                    x="-120"
                    y="-56"
                    width="240"
                    height="112"
                    rx="11"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="1.5"
                    strokeDasharray="5 3"
                  />
                )}

                {/* Main Workcell Bay Enclosure */}
                <rect
                  x="-115"
                  y="-52"
                  width="230"
                  height="104"
                  rx="9"
                  fill={isSelected ? '#1B2920' : '#131D17'}
                  stroke={isSelected ? '#C2D6A8' : '#334037'}
                  strokeWidth={isSelected ? '1.8' : '1.2'}
                />

                {/* Left Status Accent Bar */}
                <rect
                  x="-115"
                  y="-52"
                  width="5"
                  height="104"
                  rx="2.5"
                  fill={statusColor}
                />

                {/* Left Equipment Schematic Chamber */}
                <rect
                  x="-100"
                  y="-38"
                  width="64"
                  height="76"
                  rx="6"
                  fill="#0C1210"
                  stroke="#2A362D"
                />
                <g transform="translate(-68, 0)">
                  {renderMachineEquipmentGlyph(
                    m.id,
                    isSelected ? '#C2D6A8' : statusColor
                  )}
                </g>

                {/* Right Workcell Information & Live Readouts */}
                <text
                  x="-24"
                  y="-28"
                  className="fill-[#C2D6A8] text-[11px] font-mono font-bold"
                >
                  {m.id}
                </text>
                <text
                  x="14"
                  y="-28"
                  className="fill-[#A1ADA0] text-[10px] font-mono"
                >
                  • {m.position.bay}
                </text>
                <circle cx="98" cy="-32" r="4.5" fill={statusColor} />

                <text
                  x="-24"
                  y="-10"
                  className="fill-[#F0F3EA] text-[13px] font-sans font-semibold"
                >
                  {m.name}
                </text>

                <text
                  x="-24"
                  y="10"
                  className="fill-[#A1ADA0] text-[10px] font-mono"
                >
                  TEMP:{' '}
                  <tspan
                    fill={
                      m.temperature >= m.thresholds.tempCrit
                        ? '#EF4444'
                        : m.temperature >= m.thresholds.tempWarn
                        ? '#F59E0B'
                        : '#F0F3EA'
                    }
                    fontWeight="bold"
                  >
                    {m.temperature.toFixed(1)}°C
                  </tspan>
                  {'  '}VIB:{' '}
                  <tspan
                    fill={
                      m.vibration >= m.thresholds.vibCrit
                        ? '#EF4444'
                        : m.vibration >= m.thresholds.vibWarn
                        ? '#F59E0B'
                        : '#F0F3EA'
                    }
                    fontWeight="bold"
                  >
                    {m.vibration.toFixed(1)}
                  </tspan>
                </text>

                {/* Health Bar & Percentage */}
                <rect
                  x="-24"
                  y="24"
                  width="92"
                  height="6"
                  rx="3"
                  fill="#0C1210"
                />
                <rect
                  x="-24"
                  y="24"
                  width={Math.round((m.healthScore / 100) * 92)}
                  height="6"
                  rx="3"
                  fill={statusColor}
                />
                <text
                  x="76"
                  y="30"
                  className="fill-[#F0F3EA] text-[10px] font-mono font-bold"
                >
                  {m.healthScore}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
