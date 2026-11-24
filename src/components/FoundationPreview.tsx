import React from 'react';
import {
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import { NavSectionId, SurfaceTheme } from '../types/navigation';
import {
  FactoryOverviewMetrics,
  MachineId,
  MachineTelemetry,
  OperationalAlert,
} from '../types/telemetry';
import {
  FaultScenarioId,
  IntelligenceOverviewSummary,
  MachineHealthIntelligence,
  MaintenanceWorkOrderStatus,
  PredictiveMaintenanceRecommendation,
} from '../types/intelligence';
import { FactoryFloorMap } from './command/FactoryFloorMap';
import { MachineDetailPanel } from './command/MachineDetailPanel';
import { PredictiveMaintenanceCentre } from './intelligence/PredictiveMaintenanceCentre';

interface FoundationPreviewProps {
  activeSection: NavSectionId;
  activeTheme: SurfaceTheme;
  onSelectSection: (id: NavSectionId) => void;
  machines: MachineTelemetry[];
  overview: FactoryOverviewMetrics;
  alerts: OperationalAlert[];
  selectedMachine: MachineTelemetry;
  selectedMachineId: MachineId;
  onSelectMachine: (id: MachineId) => void;
  intelligenceList: MachineHealthIntelligence[];
  intelligenceSummary: IntelligenceOverviewSummary;
  maintenanceRecommendations: PredictiveMaintenanceRecommendation[];
  onUpdateMaintenanceStatus: (
    recommendationId: string,
    status: MaintenanceWorkOrderStatus,
    machineId: MachineId
  ) => void;
  onSetMachineOperatingProfile: (
    machineId: MachineId,
    profile: 'NOMINAL' | 'WARNING' | 'CRITICAL' | 'DEFAULT'
  ) => void;
  machineModeOverrides: Partial<Record<MachineId, 'NOMINAL' | 'WARNING' | 'CRITICAL'>>;
  machineScenarios: Partial<Record<MachineId, FaultScenarioId>>;
}

export const FoundationPreview: React.FC<FoundationPreviewProps> = ({
  activeSection,
  activeTheme,
  machines,
  overview,
  alerts,
  selectedMachine,
  selectedMachineId,
  onSelectMachine,
  intelligenceList,
  intelligenceSummary,
  maintenanceRecommendations,
  onUpdateMaintenanceStatus,
  onSetMachineOperatingProfile,
  machineModeOverrides,
}) => {
  const isDark = activeTheme === 'dark-command';
  const totalCycles = machines.reduce((sum, m) => sum + m.cycleCount, 0);
  const totalRatedKw = machines.reduce(
    (sum, m) => sum + m.thresholds.ratedPowerKw,
    0
  );
  const powerUtilizationPct = Math.round(
    (overview.totalPowerKw / Math.max(1, totalRatedKw)) * 100
  );

  // Aggregate 24-point Fleet Power Trend from rolling histories of all 6 machines
  const historyLen = machines[0]?.history.length || 0;
  const fleetPowerSeries: { timestamp: string; totalKw: number; avgEff: number }[] = [];
  for (let i = 0; i < historyLen; i++) {
    const ts = machines[0]?.history[i]?.timestamp || '';
    const sumKw = machines.reduce(
      (acc, m) => acc + (m.history[i]?.powerKw ?? m.powerKw),
      0
    );
    const avgHealthAtTick =
      machines.reduce(
        (acc, m) => acc + (m.history[i]?.healthScore ?? m.healthScore),
        0
      ) / machines.length;
    fleetPowerSeries.push({
      timestamp: ts,
      totalKw: Math.round(sumKw * 10) / 10,
      avgEff: Math.round(avgHealthAtTick * 10) / 10,
    });
  }

  // Route 1: Digital Factory Floor Dedicated Spatial Workspace ('digital-twin')
  if (activeSection === 'digital-twin') {
    return (
      <div className="space-y-6">
        <FactoryFloorMap
          machines={machines}
          selectedMachineId={selectedMachineId}
          onSelectMachine={onSelectMachine}
        />

        {/* Quick Bay Status Strip */}
        <div className="rounded-xl bg-[#101816] border border-[#26332D] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-[#26332D]">
          {machines.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelectMachine(m.id)}
              className={`px-4 py-3 text-left transition-colors ${
                m.id === selectedMachineId
                  ? 'bg-[#140F22] border-b-2 border-b-[#7EA46C]'
                  : 'hover:bg-[#17211C]'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-[#C2D6A8]">{m.id}</span>
                <span
                  className={
                    m.status === 'RUNNING'
                      ? 'text-telemetry-emerald'
                      : m.status === 'WARNING'
                      ? 'text-telemetry-amber'
                      : 'text-telemetry-crimson'
                  }
                >
                  {m.status}
                </span>
              </div>
              <div className="font-sans font-semibold text-sm text-[#F0F3EA] mt-0.5 truncate">
                {m.name}
              </div>
              <div className="text-xs font-mono text-[#A1ADA0] mt-1">
                {m.temperature.toFixed(1)}°C • {m.powerKw.toFixed(1)} kW
              </div>
            </button>
          ))}
        </div>

        <MachineDetailPanel
          machine={selectedMachine}
          activeOverride={machineModeOverrides[selectedMachine.id]}
          onSetOperatingProfile={onSetMachineOperatingProfile}
        />
      </div>
    );
  }

  // Route 2: Enterprise Analytics ('enterprise-analytics')
  if (activeSection === 'enterprise-analytics') {
    return (
      <div className="space-y-6">
        {/* Top Divided Executive Summary Ribbon */}
        <section className="rounded-xl bg-[#101816] border border-[#26332D] overflow-hidden">
          <div className="px-5 py-3.5 bg-[#17211C]/70 border-b border-[#26332D] flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-sans font-semibold text-base text-[#F0F3EA]">
                Enterprise Production Analytics &amp; Workcell Performance
              </h2>
              <p className="text-xs text-[#A1ADA0]">
                All metrics computed directly from the active 6-machine simulation state ({overview.lastTickTimestamp})
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#26332D]">
            <div className="px-5 py-4">
              <div className="text-xs text-[#A1ADA0]">Fleet Simulated OEE</div>
              <div className="font-mono text-2xl font-bold text-[#F0F3EA] mt-1">
                {overview.overallEfficiency.toFixed(1)}%
              </div>
              <div className="text-xs text-telemetry-emerald mt-0.5">
                Mean Health: {overview.averageHealth}%
              </div>
            </div>
            <div className="px-5 py-4">
              <div className="text-xs text-[#A1ADA0]">Cumulative Cycle Output</div>
              <div className="font-mono text-2xl font-bold text-[#F0F3EA] mt-1">
                {totalCycles.toLocaleString()}
              </div>
              <div className="text-xs text-[#A1ADA0] mt-0.5">
                Across Line A &amp; Line B
              </div>
            </div>
            <div className="px-5 py-4">
              <div className="text-xs text-[#A1ADA0]">Mean Fleet Anomaly Score</div>
              <div className="font-mono text-2xl font-bold text-[#C2D6A8] mt-1">
                {intelligenceSummary.averageAnomalyScore}/100
              </div>
              <div className="text-xs text-[#A1ADA0] mt-0.5">
                {intelligenceSummary.activeAnomaliesCount} active detections
              </div>
            </div>
            <div className="px-5 py-4">
              <div className="text-xs text-[#A1ADA0]">Electrical Load Utilization</div>
              <div className="font-mono text-2xl font-bold text-[#F0F3EA] mt-1">
                {powerUtilizationPct}%
              </div>
              <div className="text-xs text-[#A1ADA0] mt-0.5">
                {overview.totalPowerKw.toFixed(1)} / {totalRatedKw.toFixed(1)} kW
              </div>
            </div>
          </div>
        </section>

        {/* Visual Comparison Charts: OEE & Health by Workcell + Power Load Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Chart 1: Workcell Efficiency & Health Comparison */}
          <div className="rounded-xl bg-[#101816] border border-[#26332D] p-5 space-y-4">
            <div>
              <h3 className="font-sans font-semibold text-base text-[#F0F3EA]">
                Workcell OEE Efficiency vs. Health Score
              </h3>
              <p className="text-xs text-[#A1ADA0]">
                Live comparison across M-01 through M-06
              </p>
            </div>

            <div className="space-y-3.5">
              {machines.map((m) => (
                <div key={m.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#F0F3EA]">
                      <span className="font-mono text-[#C2D6A8] font-bold mr-1.5">
                        {m.id}
                      </span>
                      {m.name}
                    </span>
                    <span className="font-mono text-[#A1ADA0]">
                      OEE <strong className="text-[#F0F3EA]">{m.efficiency.toFixed(1)}%</strong> • Health{' '}
                      <strong className="text-telemetry-emerald">{m.healthScore}%</strong>
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#0C1210] overflow-hidden flex">
                    <div
                      className="h-full bg-[#7EA46C] transition-all duration-300"
                      style={{ width: `${m.efficiency}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart 2: Mechanical Torque Load vs. Rated Power */}
          <div className="rounded-xl bg-[#101816] border border-[#26332D] p-5 space-y-4">
            <div>
              <h3 className="font-sans font-semibold text-base text-[#F0F3EA]">
                Mechanical Duty Load &amp; Power Consumption
              </h3>
              <p className="text-xs text-[#A1ADA0]">
                Percentage of continuous mechanical rating (93% critical ceiling)
              </p>
            </div>

            <div className="space-y-3.5">
              {machines.map((m) => (
                <div key={m.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#F0F3EA]">
                      <span className="font-mono text-[#C2D6A8] font-bold mr-1.5">
                        {m.id}
                      </span>
                      {m.name}
                    </span>
                    <span className="font-mono text-[#A1ADA0]">
                      Load <strong className="text-[#F0F3EA]">{m.load.toFixed(1)}%</strong> •{' '}
                      <strong className="text-[#C2D6A8]">{m.powerKw.toFixed(1)} kW</strong>
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#0C1210] overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        m.load >= 93
                          ? 'bg-telemetry-crimson'
                          : m.load >= 88
                          ? 'bg-telemetry-amber'
                          : 'bg-telemetry-emerald'
                      }`}
                      style={{ width: `${m.load}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Full Workcell Comparative Telemetry Table */}
        <section className="rounded-xl bg-[#101816] border border-[#26332D] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#26332D]">
            <h3 className="font-sans font-semibold text-base text-[#F0F3EA]">
              Complete Workcell Telemetry Ledger
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#26332D] bg-[#0C1210] text-[#A1ADA0]">
                  <th className="py-3 px-4 font-medium">Workcell</th>
                  <th className="py-3 px-4 font-medium">Bay / Zone</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Health</th>
                  <th className="py-3 px-4 font-medium">Anomaly Index</th>
                  <th className="py-3 px-4 font-medium">OEE</th>
                  <th className="py-3 px-4 font-medium">Temperature</th>
                  <th className="py-3 px-4 font-medium">Vibration</th>
                  <th className="py-3 px-4 font-medium">Power / Load</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26332D]">
                {machines.map((m) => {
                  const intel = intelligenceList.find((i) => i.machineId === m.id);
                  return (
                    <tr
                      key={m.id}
                      onClick={() => onSelectMachine(m.id)}
                      className="hover:bg-[#17211C] cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-[#F0F3EA]">
                        <span className="font-mono font-bold text-[#C2D6A8] mr-2">
                          {m.id}
                        </span>
                        {m.name}
                      </td>
                      <td className="py-3 px-4 text-[#A1ADA0]">
                        {m.position.bay} • {m.position.zone}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            m.status === 'RUNNING'
                              ? 'bg-telemetry-emerald/15 text-telemetry-emerald'
                              : m.status === 'WARNING'
                              ? 'bg-telemetry-amber/15 text-telemetry-amber'
                              : 'bg-telemetry-crimson/20 text-telemetry-crimson'
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-telemetry-emerald">
                        {m.healthScore}%
                      </td>
                      <td className="py-3 px-4 font-mono text-[#C2D6A8] font-semibold">
                        {intel?.anomalyScore ?? 0}/100 ({intel?.riskCategory})
                      </td>
                      <td className="py-3 px-4 font-mono text-[#F0F3EA]">
                        {m.efficiency.toFixed(1)}%
                      </td>
                      <td className="py-3 px-4 font-mono text-[#F0F3EA]">
                        {m.temperature.toFixed(1)} °C
                      </td>
                      <td className="py-3 px-4 font-mono text-[#F0F3EA]">
                        {m.vibration.toFixed(2)} mm/s
                      </td>
                      <td className="py-3 px-4 font-mono text-[#F0F3EA]">
                        {m.powerKw.toFixed(1)} kW ({m.load.toFixed(0)}%)
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <PredictiveMaintenanceCentre
          recommendations={maintenanceRecommendations}
          selectedMachineId={selectedMachineId}
          onSelectMachine={onSelectMachine}
          onUpdateStatus={onUpdateMaintenanceStatus}
        />
      </div>
    );
  }

  // Route 3: Energy & Power Ledger ('energy-sustainability')
  if (activeSection === 'energy-sustainability') {
    const chartW = 720;
    const chartH = 180;
    const padL = 44;
    const padR = 16;
    const padT = 16;
    const padB = 26;
    const plotW = chartW - padL - padR;
    const plotH = chartH - padT - padB;
    const kwValues = fleetPowerSeries.map((d) => d.totalKw);
    const minKw = Math.floor(Math.min(...kwValues, 140) * 0.92);
    const maxKw = Math.ceil(Math.max(...kwValues, 224) * 1.04);
    const rangeKw = Math.max(1, maxKw - minKw);
    const toX = (i: number) =>
      padL + (i / Math.max(1, fleetPowerSeries.length - 1)) * plotW;
    const toY = (val: number) =>
      padT + plotH - ((val - minKw) / rangeKw) * plotH;
    const polyPoints = fleetPowerSeries
      .map((pt, i) => `${toX(i).toFixed(1)},${toY(pt.totalKw).toFixed(1)}`)
      .join(' ');

    return (
      <div className="space-y-6">
        {/* Rolling Fleet Power Trend Line Chart */}
        <section className="rounded-xl bg-[#101816] border border-[#26332D] p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-sans font-semibold text-base text-[#F0F3EA]">
                Fleet Electrical Power Demand Trend (Rolling 24-Sample Sum)
              </h2>
              <p className="text-xs text-[#A1ADA0]">
                Aggregate kW power draw across M-01 through M-06 vs. 224.0 kW rated plant capacity
              </p>
            </div>
            <div className="text-right font-mono">
              <div className="text-xl font-bold text-[#F0F3EA]">
                {overview.totalPowerKw.toFixed(1)} kW
              </div>
              <div className="text-xs text-[#C2D6A8]">
                {powerUtilizationPct}% Rated Load
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-[#0C1210] border border-[#26332D] p-4">
            <svg
              viewBox={`0 0 ${chartW} ${chartH}`}
              className="w-full h-44 overflow-visible select-none"
            >
              {[0, 0.5, 1].map((frac, idx) => {
                const yVal = minKw + rangeKw * (1 - frac);
                const yPos = padT + plotH * frac;
                return (
                  <g key={idx}>
                    <line
                      x1={padL}
                      y1={yPos}
                      x2={chartW - padR}
                      y2={yPos}
                      stroke="#181324"
                      strokeWidth="1"
                    />
                    <text
                      x={padL - 8}
                      y={yPos + 3}
                      textAnchor="end"
                      className="fill-[#A1ADA0] text-[10px] font-mono"
                    >
                      {yVal.toFixed(0)} kW
                    </text>
                  </g>
                );
              })}

              {/* Rated Capacity Line (224 kW) */}
              {toY(224) >= padT && toY(224) <= padT + plotH && (
                <line
                  x1={padL}
                  y1={toY(224)}
                  x2={chartW - padR}
                  y2={toY(224)}
                  stroke="#F59E0B"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                />
              )}

              {fleetPowerSeries.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#C2D6A8"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={polyPoints}
                />
              )}
            </svg>
          </div>
        </section>

        {/* Per-Workcell Power & Phase Current Breakdown Table */}
        <section className="rounded-xl bg-[#101816] border border-[#26332D] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#26332D]">
            <h3 className="font-sans font-semibold text-base text-[#F0F3EA]">
              Workcell Electrical Load &amp; Phase Current Ledger
            </h3>
          </div>
          <div className="divide-y divide-[#26332D]">
            {machines.map((m) => {
              const pct = Math.min(
                100,
                Math.round((m.powerKw / m.thresholds.ratedPowerKw) * 100)
              );
              return (
                <div
                  key={m.id}
                  onClick={() => onSelectMachine(m.id)}
                  className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#17211C] cursor-pointer transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#C2D6A8]">
                        {m.id}
                      </span>
                      <span className="font-sans font-semibold text-sm text-[#F0F3EA]">
                        {m.name}
                      </span>
                      <span className="text-xs text-[#A1ADA0]">
                        ({m.position.bay})
                      </span>
                    </div>
                    <div className="text-xs font-mono text-[#A1ADA0] mt-1">
                      Phase Current: <strong className="text-[#F0F3EA]">{m.current.toFixed(1)} A</strong> (Nominal {m.thresholds.nominalCurrent} A) • Torque Load: <strong className="text-[#F0F3EA]">{m.load.toFixed(1)}%</strong>
                    </div>
                  </div>

                  <div className="w-full sm:w-64 space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-[#F0F3EA] font-bold">
                        {m.powerKw.toFixed(1)} / {m.thresholds.ratedPowerKw} kW
                      </span>
                      <span className="text-[#A1ADA0]">{pct}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#0C1210] overflow-hidden">
                      <div
                        className={`h-full ${
                          pct >= 95
                            ? 'bg-telemetry-crimson'
                            : pct >= 85
                            ? 'bg-telemetry-amber'
                            : 'bg-[#7EA46C]'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  // Route 4: Architecture & Design System ('system-governance')
  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-[#101816] border border-[#26332D] p-6 space-y-5">
        <div className="pb-4 border-b border-[#26332D]">
          <h2 className="font-sans text-xl font-bold text-[#F0F3EA]">
            System Architecture &amp; Dark Obsidian + Electric Purple Specification
          </h2>
          <p className="text-xs text-[#A1ADA0] mt-1">
            Active Surface Mode: {isDark ? 'Dark Obsidian (#0B1110 / #101816 / #17211C)' : 'Light Inspection Surface'} • Active Sensor Alerts: {alerts.length}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg bg-[#0C1210] border border-[#26332D] p-4 space-y-3">
            <div className="text-xs font-mono font-semibold text-[#F0F3EA] flex justify-between">
              <span>OBSIDIAN SURFACES</span>
              <span className="text-[#C2D6A8]">#0B1110 → #17211C</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="h-8 rounded bg-[#0B1110] border border-[#26332D]" title="#0B1110 Obsidian Black" />
              <div className="h-8 rounded bg-[#101816] border border-[#26332D]" title="#101816 Purple-Black" />
              <div className="h-8 rounded bg-[#17211C] border border-[#26332D]" title="#17211C Dark Graphite" />
              <div className="h-8 rounded bg-[#26332D] border border-[#262038]" title="#26332D Hairline Border" />
            </div>
          </div>

          <div className="rounded-lg bg-[#0C1210] border border-[#26332D] p-4 space-y-3">
            <div className="text-xs font-mono font-semibold text-[#F0F3EA] flex justify-between">
              <span>ACCENT &amp; TYPOGRAPHY</span>
              <span className="text-[#C2D6A8]">#7EA46C / #C2D6A8</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="h-8 rounded bg-[#7EA46C]" title="#7EA46C Electric Purple" />
              <div className="h-8 rounded bg-[#C2D6A8]" title="#C2D6A8 Lavender" />
              <div className="h-8 rounded bg-[#F0F3EA]" title="#F0F3EA Primary Text" />
              <div className="h-8 rounded bg-[#A1ADA0]" title="#A1ADA0 Secondary Text" />
            </div>
          </div>

          <div className="rounded-lg bg-[#0C1210] border border-[#26332D] p-4 space-y-3">
            <div className="text-xs font-mono font-semibold text-[#F0F3EA] flex justify-between">
              <span>SEMANTIC STATUS</span>
              <span className="text-telemetry-emerald">ISO / ISA-101</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="h-8 rounded bg-telemetry-emerald" title="#10B981 Emerald" />
              <div className="h-8 rounded bg-telemetry-amber" title="#F59E0B Amber" />
              <div className="h-8 rounded bg-telemetry-crimson" title="#EF4444 Crimson" />
              <div className="h-8 rounded bg-telemetry-blue" title="#3B82F6 Electric Blue" />
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-[#26332D] flex flex-wrap items-center justify-between gap-2 text-xs text-[#A1ADA0]">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-telemetry-emerald" />
            Single-Source-of-Truth Simulation Engine (6 Machines • 1.5s Interval)
          </span>
          <span className="flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-[#C2D6A8]" />
            Typography: Inter (UI) + JetBrains Mono (Telemetry)
          </span>
        </div>
      </section>
    </div>
  );
};
