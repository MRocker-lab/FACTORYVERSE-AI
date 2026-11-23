import React from 'react';
import { RotateCcw } from 'lucide-react';
import { MachineId, MachineTelemetry } from '../../types/telemetry';
import { TelemetryLineChart } from './TelemetryLineChart';

interface MachineDetailPanelProps {
  machine: MachineTelemetry;
  activeOverride?: 'NOMINAL' | 'WARNING' | 'CRITICAL';
  onSetOperatingProfile: (
    machineId: MachineId,
    profile: 'NOMINAL' | 'WARNING' | 'CRITICAL' | 'DEFAULT'
  ) => void;
}

export const MachineDetailPanel: React.FC<MachineDetailPanelProps> = ({
  machine,
  activeOverride,
  onSetOperatingProfile,
}) => {
  const statusColor =
    machine.status === 'RUNNING'
      ? 'text-telemetry-emerald bg-telemetry-emerald/15 border-telemetry-emerald/35'
      : machine.status === 'WARNING'
      ? 'text-telemetry-amber bg-telemetry-amber/15 border-telemetry-amber/40'
      : 'text-telemetry-crimson bg-telemetry-crimson/20 border-telemetry-crimson/50';

  const rpmPct = Math.min(
    100,
    Math.round((machine.rpm / machine.thresholds.maxRpm) * 100)
  );
  const currentPct = Math.min(
    100,
    Math.round((machine.current / (machine.thresholds.nominalCurrent * 1.25)) * 100)
  );
  const powerPct = Math.min(
    100,
    Math.round((machine.powerKw / machine.thresholds.ratedPowerKw) * 100)
  );

  return (
    <div className="rounded-2xl surface-obsidian overflow-hidden">
      {/* Header Bar */}
      <div className="px-5 py-4 bg-gradient-to-r from-[#130E21]/85 via-[#0C0816]/85 to-[#130E21]/85 border-b border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#7C3AED]/20 text-[#A78BFA] border border-[#7C3AED]/45">
              {machine.id}
            </span>
            <h3 className="font-sans text-lg font-bold text-[#F4F2FA]">
              {machine.name}
            </h3>
            <span
              className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded-md border ${statusColor}`}
            >
              {machine.status}
            </span>
          </div>
          <p className="text-xs text-[#9A94B0] mt-1">
            {machine.position.bay} ({machine.position.zone}) • Controller:{' '}
            <span className="font-mono text-[#F4F2FA]">{machine.controller}</span>
          </p>
        </div>

        {/* Clean Telemetry Test Profile Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap shrink-0">
          <div className="inline-flex items-center p-0.5 rounded-lg bg-[#05030A] border border-white/[0.07]">
            <button
              type="button"
              onClick={() => onSetOperatingProfile(machine.id, 'NOMINAL')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                activeOverride === 'NOMINAL'
                  ? 'bg-telemetry-emerald text-[#030206] font-semibold'
                  : 'text-[#9A94B0] hover:text-[#F4F2FA]'
              }`}
            >
              Stabilize
            </button>
            <button
              type="button"
              onClick={() => onSetOperatingProfile(machine.id, 'WARNING')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                activeOverride === 'WARNING'
                  ? 'bg-telemetry-amber text-[#030206] font-semibold'
                  : 'text-[#9A94B0] hover:text-[#F4F2FA]'
              }`}
            >
              Drift Test
            </button>
            <button
              type="button"
              onClick={() => onSetOperatingProfile(machine.id, 'CRITICAL')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                activeOverride === 'CRITICAL'
                  ? 'bg-telemetry-crimson text-white font-semibold'
                  : 'text-[#9A94B0] hover:text-[#F4F2FA]'
              }`}
            >
              Stress Fault
            </button>
          </div>
          {activeOverride && (
            <button
              type="button"
              onClick={() => onSetOperatingProfile(machine.id, 'DEFAULT')}
              className="p-1.5 rounded-lg bg-[#110D1B] border border-white/[0.08] text-[#9A94B0] hover:text-[#F4F2FA]"
              title="Reset to default profile"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Unified Divided Parameter Ribbon with Micro Progress Gauges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.06] border-b border-white/[0.07] bg-[#07050E]/90">
        {/* 1. Rotational Speed */}
        <div className="px-4 py-3.5">
          <div className="text-[11px] font-medium text-[#9A94B0]">
            Rotational Speed
          </div>
          <div className="font-mono text-base font-bold text-[#F4F2FA] tabular-nums mt-0.5">
            {machine.rpm.toLocaleString()}{' '}
            <span className="text-xs font-normal text-[#9A94B0]">RPM</span>
          </div>
          <div className="mt-2 w-full h-1 rounded-full bg-[#141020] overflow-hidden">
            <div
              className="h-full bg-[#A78BFA] transition-all duration-300"
              style={{ width: `${rpmPct}%` }}
            />
          </div>
        </div>

        {/* 2. Phase Current */}
        <div className="px-4 py-3.5">
          <div className="text-[11px] font-medium text-[#9A94B0]">
            Phase Current
          </div>
          <div className="font-mono text-base font-bold text-[#F4F2FA] tabular-nums mt-0.5">
            {machine.current.toFixed(1)}{' '}
            <span className="text-xs font-normal text-[#9A94B0]">A</span>
          </div>
          <div className="mt-2 w-full h-1 rounded-full bg-[#141020] overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                machine.current > machine.thresholds.nominalCurrent * 1.04
                  ? 'bg-telemetry-amber'
                  : 'bg-telemetry-emerald'
              }`}
              style={{ width: `${currentPct}%` }}
            />
          </div>
        </div>

        {/* 3. Mechanical Load */}
        <div className="px-4 py-3.5">
          <div className="text-[11px] font-medium text-[#9A94B0]">
            Mechanical Load
          </div>
          <div className="font-mono text-base font-bold text-[#F4F2FA] tabular-nums mt-0.5">
            {machine.load.toFixed(1)}%
          </div>
          <div className="mt-2 w-full h-1 rounded-full bg-[#141020] overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                machine.load >= 93
                  ? 'bg-telemetry-crimson'
                  : machine.load >= 88
                  ? 'bg-telemetry-amber'
                  : 'bg-[#7C3AED]'
              }`}
              style={{ width: `${Math.min(100, machine.load)}%` }}
            />
          </div>
        </div>

        {/* 4. Health Score */}
        <div className="px-4 py-3.5">
          <div className="text-[11px] font-medium text-[#9A94B0]">
            Health Score
          </div>
          <div
            className={`font-mono text-base font-bold tabular-nums mt-0.5 ${
              machine.healthScore >= 80
                ? 'text-telemetry-emerald'
                : machine.healthScore >= 55
                ? 'text-telemetry-amber'
                : 'text-telemetry-crimson'
            }`}
          >
            {machine.healthScore}%
          </div>
          <div className="mt-2 w-full h-1 rounded-full bg-[#141020] overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                machine.healthScore >= 80
                  ? 'bg-telemetry-emerald'
                  : machine.healthScore >= 55
                  ? 'bg-telemetry-amber'
                  : 'bg-telemetry-crimson'
              }`}
              style={{ width: `${machine.healthScore}%` }}
            />
          </div>
        </div>

        {/* 5. Active Power */}
        <div className="px-4 py-3.5">
          <div className="text-[11px] font-medium text-[#9A94B0]">
            Active Power
          </div>
          <div className="font-mono text-base font-bold text-[#F4F2FA] tabular-nums mt-0.5">
            {machine.powerKw.toFixed(1)}{' '}
            <span className="text-xs font-normal text-[#9A94B0]">kW</span>
          </div>
          <div className="mt-2 w-full h-1 rounded-full bg-[#141020] overflow-hidden">
            <div
              className="h-full bg-[#7C3AED] transition-all duration-300"
              style={{ width: `${powerPct}%` }}
            />
          </div>
        </div>

        {/* 6. Simulated Cycles */}
        <div className="px-4 py-3.5">
          <div className="text-[11px] font-medium text-[#9A94B0]">
            Cycle Counter
          </div>
          <div className="font-mono text-base font-bold text-[#F4F2FA] tabular-nums mt-0.5">
            {machine.cycleCount.toLocaleString()}
          </div>
          <div className="text-[11px] font-mono text-[#9A94B0] mt-1">
            OEE: {machine.efficiency.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Waveform Charts */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <TelemetryLineChart
          title="Core Temperature Trend"
          subtitle="Rolling 24-sample RTD stream"
          unit="°C"
          data={machine.history}
          dataKey="temperature"
          warnThreshold={machine.thresholds.tempWarn}
          critThreshold={machine.thresholds.tempCrit}
          accentColor="#A78BFA"
        />

        <TelemetryLineChart
          title="Vibration Velocity (RMS)"
          subtitle="ISO-10816 tri-axial accelerometer"
          unit="mm/s"
          data={machine.history}
          dataKey="vibration"
          warnThreshold={machine.thresholds.vibWarn}
          critThreshold={machine.thresholds.vibCrit}
          accentColor="#10B981"
          minDomain={0}
        />
      </div>
    </div>
  );
};
