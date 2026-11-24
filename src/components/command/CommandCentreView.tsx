import React, { useState } from 'react';
import {
  FactoryOverviewMetrics,
  MachineId,
  MachineTelemetry,
  OperationalAlert,
} from '../../types/telemetry';
import {
  FaultScenarioId,
  MachineHealthIntelligence,
} from '../../types/intelligence';
import { FactoryOverviewBar } from './FactoryOverviewBar';
import { FactoryFloorMap } from './FactoryFloorMap';
import { MachineCard } from './MachineCard';
import { MachineDetailPanel } from './MachineDetailPanel';
import { AlertsPanel } from './AlertsPanel';
import { AIExplanationPanel } from '../intelligence/AIExplanationPanel';
import { FaultInjectionLab } from '../intelligence/FaultInjectionLab';

interface CommandCentreViewProps {
  machines: MachineTelemetry[];
  overview: FactoryOverviewMetrics;
  alerts: OperationalAlert[];
  selectedMachine: MachineTelemetry;
  selectedMachineId: MachineId;
  onSelectMachine: (id: MachineId) => void;
  isPaused: boolean;
  onTogglePause: () => void;
  onAcknowledgeAlert: (alertId: string) => void;
  onSetMachineOperatingProfile: (
    machineId: MachineId,
    profile: 'NOMINAL' | 'WARNING' | 'CRITICAL' | 'DEFAULT'
  ) => void;
  machineModeOverrides: Partial<Record<MachineId, 'NOMINAL' | 'WARNING' | 'CRITICAL'>>;
  selectedIntelligence: MachineHealthIntelligence;
  machineScenarios: Partial<Record<MachineId, FaultScenarioId>>;
  onInjectScenario: (machineId: MachineId, scenario: FaultScenarioId) => void;
}

export const CommandCentreView: React.FC<CommandCentreViewProps> = ({
  machines,
  overview,
  alerts,
  selectedMachine,
  selectedMachineId,
  onSelectMachine,
  isPaused,
  onTogglePause,
  onAcknowledgeAlert,
  onSetMachineOperatingProfile,
  machineModeOverrides,
  selectedIntelligence,
  machineScenarios,
  onInjectScenario,
}) => {
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'RUNNING' | 'WARNING' | 'CRITICAL'
  >('ALL');

  const filteredMachines =
    statusFilter === 'ALL'
      ? machines
      : machines.filter((m) => m.status === statusFilter);

  const lineAMachines = machines.slice(0, 3);
  const lineBMachines = machines.slice(3, 6);
  const lineAPower = lineAMachines.reduce((s, m) => s + m.powerKw, 0);
  const lineBPower = lineBMachines.reduce((s, m) => s + m.powerKw, 0);
  const lineAEff =
    lineAMachines.reduce((s, m) => s + m.efficiency, 0) / lineAMachines.length;
  const lineBEff =
    lineBMachines.reduce((s, m) => s + m.efficiency, 0) / lineBMachines.length;

  return (
    <div className="space-y-7">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between pt-1">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C2D6A8]">
            <span className="h-1.5 w-1.5 rounded-full bg-telemetry-emerald shadow-[0_0_10px_#10B981]" />
            Plant operations · Sector A/B
          </div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-[#F0F3EA]">
            Command centre
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[#A1ADA0]">
            Live production health, machine telemetry, and predictive maintenance in one view.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto rounded-xl border border-white/[0.08] bg-[#101816]/80 px-3.5 py-2.5 text-xs text-[#A1ADA0]">
          <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-telemetry-emerald opacity-40" /><span className="relative inline-flex h-2 w-2 rounded-full bg-telemetry-emerald" /></span>
          Simulation stream <span className="font-semibold text-[#F0F3EA]">{isPaused ? 'Paused' : 'Live'}</span>
        </div>
      </section>

      {/* HIERARCHY LEVEL 1: FACTORY OPERATIONAL STATUS RIBBON */}
      <FactoryOverviewBar
        overview={overview}
        isPaused={isPaused}
        onTogglePause={onTogglePause}
        activeFilter={statusFilter}
        onSelectFilter={setStatusFilter}
      />

      {/* HIERARCHY LEVEL 2 & 3: DIGITAL FACTORY FLOOR CENTREPIECE + CRITICAL INCIDENTS FEED */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8">
          <FactoryFloorMap
            machines={machines}
            selectedMachineId={selectedMachineId}
            onSelectMachine={onSelectMachine}
          />
        </div>
        <div className="xl:col-span-4">
          <AlertsPanel
            alerts={alerts}
            machines={machines}
            selectedMachineId={selectedMachineId}
            onSelectMachine={onSelectMachine}
            onAcknowledgeAlert={onAcknowledgeAlert}
          />
        </div>
      </div>

      {/* HIERARCHY LEVEL 4: WORKCELL TELEMETRY SELECTOR + LIVE WAVEFORM DIAGNOSTICS */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-sans font-semibold text-base text-[#F0F3EA]">
              Workcell Telemetry &amp; Real-Time Diagnostics
            </h2>
            <p className="text-xs text-[#A1ADA0]">
              Showing {filteredMachines.length} of {machines.length} machines — select any unit to update the waveform inspector
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {(['ALL', 'RUNNING', 'WARNING', 'CRITICAL'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  statusFilter === f
                    ? 'bg-[#140F22] border-[#7EA46C] text-[#F0F3EA]'
                    : 'bg-[#101816] border-[#26332D] text-[#A1ADA0] hover:text-[#F0F3EA]'
                }`}
              >
                {f === 'ALL' ? 'All Units (6)' : f}
              </button>
            ))}
          </div>
        </div>

        {/* Split Workbench: Left 5 Cols Compact Machine Cards, Right 7 Cols Active Machine Waveform Inspector */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          <div className="xl:col-span-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-3">
            {filteredMachines.map((machine) => (
              <MachineCard
                key={machine.id}
                machine={machine}
                isSelected={machine.id === selectedMachineId}
                onSelect={onSelectMachine}
              />
            ))}
          </div>

          <div className="xl:col-span-7" id="machine-detail-anchor">
            <MachineDetailPanel
              machine={selectedMachine}
              activeOverride={machineModeOverrides[selectedMachine.id]}
              onSetOperatingProfile={onSetMachineOperatingProfile}
            />
          </div>
        </div>
      </section>

      {/* HIERARCHY LEVEL 5: PRODUCTION LINE PERFORMANCE & ENERGY DISTRIBUTION STRIP */}
      <section className="rounded-2xl surface-obsidian overflow-hidden">
        <div className="px-5 py-3.5 bg-gradient-to-r from-[#151F19]/85 via-[#111A15]/85 to-[#151F19]/85 border-b border-white/[0.07] flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-sans font-semibold text-sm text-[#F0F3EA]">
              Production Line Performance &amp; Electrical Load Allocation
            </h3>
            <p className="text-xs text-[#A1ADA0]">
              Real-time efficiency and kW power draw across Line A (Machining) and Line B (Stamping &amp; Assembly)
            </p>
          </div>
          <span className="font-mono text-xs text-[#F0F3EA] tabular-nums">
            Total Demand: <strong className="text-[#C2D6A8]">{overview.totalPowerKw.toFixed(1)} kW</strong> / 224.0 kW Rated
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.06]">
          {/* Line A Summary */}
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-semibold text-[#C2D6A8]">
                  NORTH PRODUCTION LINE A
                </span>
                <div className="text-sm font-semibold text-[#F0F3EA]">
                  M-01 Conveyor • M-02 Pump • M-03 CNC Mill
                </div>
              </div>
              <div className="text-right font-mono tabular-nums">
                <div className="text-sm font-bold text-[#F0F3EA]">
                  {lineAPower.toFixed(1)} kW
                </div>
                <div className="text-xs text-telemetry-emerald">
                  OEE {lineAEff.toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              {lineAMachines.map((m) => (
                <div
                  key={m.id}
                  onClick={() => onSelectMachine(m.id)}
                  className="p-2.5 rounded-xl surface-well hover:border-[#7EA46C] cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                    <span className="text-[#C2D6A8] font-semibold">{m.id}</span>
                    <span className="text-[#F0F3EA]">{m.powerKw.toFixed(1)} kW</span>
                  </div>
                  <div className="mt-2 w-full h-1.5 bg-[#1A241F] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#7EA46C] to-[#C2D6A8]"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round((m.powerKw / m.thresholds.ratedPowerKw) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Line B Summary */}
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-semibold text-[#C2D6A8]">
                  SOUTH PRODUCTION LINE B
                </span>
                <div className="text-sm font-semibold text-[#F0F3EA]">
                  M-04 Robot Arm • M-05 Hydraulic Press • M-06 Chiller
                </div>
              </div>
              <div className="text-right font-mono tabular-nums">
                <div className="text-sm font-bold text-[#F0F3EA]">
                  {lineBPower.toFixed(1)} kW
                </div>
                <div className="text-xs text-telemetry-emerald">
                  OEE {lineBEff.toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              {lineBMachines.map((m) => (
                <div
                  key={m.id}
                  onClick={() => onSelectMachine(m.id)}
                  className="p-2.5 rounded-xl surface-well hover:border-[#7EA46C] cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                    <span className="text-[#C2D6A8] font-semibold">{m.id}</span>
                    <span className="text-[#F0F3EA]">{m.powerKw.toFixed(1)} kW</span>
                  </div>
                  <div className="mt-2 w-full h-1.5 bg-[#1A241F] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#7EA46C] to-[#C2D6A8]"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round((m.powerKw / m.thresholds.ratedPowerKw) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* INTEGRATED DIAGNOSTIC EXPLANATION & FAULT INJECTION CONTROLS */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-7">
          <AIExplanationPanel intelligence={selectedIntelligence} />
        </div>
        <div className="xl:col-span-5">
          <FaultInjectionLab
            machines={machines}
            selectedMachineId={selectedMachineId}
            onSelectMachine={onSelectMachine}
            machineScenarios={machineScenarios}
            onInjectScenario={onInjectScenario}
            selectedIntelligence={selectedIntelligence}
          />
        </div>
      </section>
    </div>
  );
};
