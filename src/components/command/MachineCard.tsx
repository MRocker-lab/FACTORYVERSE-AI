import React from 'react';
import { MachineId, MachineStatus, MachineTelemetry } from '../../types/telemetry';

interface MachineCardProps {
  machine: MachineTelemetry;
  isSelected: boolean;
  onSelect: (id: MachineId) => void;
}

const getStatusStyle = (status: MachineStatus) => {
  switch (status) {
    case 'RUNNING':
      return {
        badge: 'bg-telemetry-emerald/15 text-telemetry-emerald border-telemetry-emerald/35',
        dot: 'bg-telemetry-emerald shadow-[0_0_8px_#10B981]',
        bar: 'bg-telemetry-emerald',
        stroke: '#10B981',
      };
    case 'WARNING':
      return {
        badge: 'bg-telemetry-amber/15 text-telemetry-amber border-telemetry-amber/40',
        dot: 'bg-telemetry-amber shadow-[0_0_8px_#F59E0B]',
        bar: 'bg-telemetry-amber',
        stroke: '#F59E0B',
      };
    case 'CRITICAL':
      return {
        badge: 'bg-telemetry-crimson/20 text-telemetry-crimson border-telemetry-crimson/50',
        dot: 'bg-telemetry-crimson animate-ping',
        bar: 'bg-telemetry-crimson',
        stroke: '#EF4444',
      };
  }
};

export const MachineCard: React.FC<MachineCardProps> = ({
  machine,
  isSelected,
  onSelect,
}) => {
  const styles = getStatusStyle(machine.status);
  const isTempElevated = machine.temperature >= machine.thresholds.tempWarn;
  const isVibElevated = machine.vibration >= machine.thresholds.vibWarn;

  // Compute inline 16-point mini thermal sparkline path
  const recentHistory = machine.history.slice(-16);
  const temps = recentHistory.map((h) => h.temperature);
  const minT = Math.min(...temps, machine.thresholds.tempWarn * 0.75);
  const maxT = Math.max(...temps, machine.thresholds.tempCrit * 1.02);
  const rangeT = Math.max(1, maxT - minT);
  const sparkW = 88;
  const sparkH = 22;
  const sparkPoints = recentHistory
    .map((pt, idx) => {
      const x = (idx / Math.max(1, recentHistory.length - 1)) * sparkW;
      const y = sparkH - ((pt.temperature - minT) / rangeT) * (sparkH - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <button
      type="button"
      onClick={() => onSelect(machine.id)}
      className={`w-full text-left rounded-xl p-4 relative overflow-hidden group ${
        isSelected
          ? 'surface-obsidian-selected'
          : 'surface-obsidian-Interactive'
      }`}
    >
      {/* Left vertical status indicator bar */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${styles.bar}`}
      />

      {/* Row 1: ID + Name + Operating Status */}
      <div className="flex items-start justify-between gap-2 pl-1.5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-[#05030A] text-[#A78BFA] border border-white/[0.07]">
              {machine.id}
            </span>
            <span className="text-[11px] font-mono text-[#9A94B0] truncate">
              {machine.position.bay}
            </span>
          </div>
          <h3 className="font-sans font-semibold text-base text-[#F4F2FA] mt-1.5 group-hover:text-white truncate">
            {machine.name}
          </h3>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold border shrink-0 ${styles.badge}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
          {machine.status}
        </span>
      </div>

      {/* Row 2: Live Sparkline & Health Score */}
      <div className="mt-3.5 pl-1.5 flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9A94B0] block">
            Health Score
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span
              className={`font-mono text-xl font-bold tabular-nums ${
                machine.healthScore >= 80
                  ? 'text-telemetry-emerald'
                  : machine.healthScore >= 55
                  ? 'text-telemetry-amber'
                  : 'text-telemetry-crimson'
              }`}
            >
              {machine.healthScore}%
            </span>
            <span className="text-[11px] font-mono text-[#9A94B0]">
              • {machine.powerKw.toFixed(1)} kW
            </span>
          </div>
        </div>

        {/* Mini Live Waveform Sparkline */}
        <div className="flex flex-col items-end">
          <svg
            width={sparkW}
            height={sparkH}
            viewBox={`0 0 ${sparkW} ${sparkH}`}
            className="overflow-visible"
          >
            {recentHistory.length > 1 && (
              <polyline
                fill="none"
                stroke={isSelected ? '#A78BFA' : styles.stroke}
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={sparkPoints}
              />
            )}
          </svg>
          <span className="text-[10px] font-mono text-[#9A94B0] mt-0.5">
            24-pt trend
          </span>
        </div>
      </div>

      {/* Row 3: 3-Column Tabular Telemetry Readout (Temperature, Vibration, RPM) */}
      <div className="mt-3 pt-3 pl-1.5 border-t border-white/[0.07] grid grid-cols-3 gap-2">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[#9A94B0]">
            Temp
          </div>
          <div
            className={`font-mono text-sm font-bold tabular-nums mt-0.5 ${
              machine.temperature >= machine.thresholds.tempCrit
                ? 'text-telemetry-crimson'
                : isTempElevated
                ? 'text-telemetry-amber'
                : 'text-[#F4F2FA]'
            }`}
          >
            {machine.temperature.toFixed(1)}°C
          </div>
        </div>

        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[#9A94B0]">
            Vibration
          </div>
          <div
            className={`font-mono text-sm font-bold tabular-nums mt-0.5 ${
              machine.vibration >= machine.thresholds.vibCrit
                ? 'text-telemetry-crimson'
                : isVibElevated
                ? 'text-telemetry-amber'
                : 'text-[#F4F2FA]'
            }`}
          >
            {machine.vibration.toFixed(2)}{' '}
            <span className="text-[10px] font-normal text-[#9A94B0]">mm/s</span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[#9A94B0]">
            Speed
          </div>
          <div className="font-mono text-sm font-bold text-[#F4F2FA] tabular-nums mt-0.5">
            {machine.rpm.toLocaleString()}{' '}
            <span className="text-[10px] font-normal text-[#9A94B0]">rpm</span>
          </div>
        </div>
      </div>
    </button>
  );
};
