import React from 'react';
import {
  Pause,
  Play,
  ArrowUpRight,
} from 'lucide-react';
import { MachineId, MachineTelemetry } from '../../types/telemetry';
import {
  FaultScenarioId,
  IntelligenceOverviewSummary,
  MachineHealthIntelligence,
  MaintenanceWorkOrderStatus,
  PredictiveMaintenanceRecommendation,
  RiskCategory,
} from '../../types/intelligence';
import { FaultInjectionLab } from './FaultInjectionLab';
import { AIExplanationPanel } from './AIExplanationPanel';
import { PredictiveMaintenanceCentre } from './PredictiveMaintenanceCentre';

interface AIIntelligenceDashboardProps {
  machines: MachineTelemetry[];
  selectedMachineId: MachineId;
  onSelectMachine: (id: MachineId) => void;
  intelligenceList: MachineHealthIntelligence[];
  selectedIntelligence: MachineHealthIntelligence;
  intelligenceSummary: IntelligenceOverviewSummary;
  maintenanceRecommendations: PredictiveMaintenanceRecommendation[];
  machineScenarios: Partial<Record<MachineId, FaultScenarioId>>;
  onInjectScenario: (machineId: MachineId, scenario: FaultScenarioId) => void;
  onUpdateMaintenanceStatus: (
    recommendationId: string,
    status: MaintenanceWorkOrderStatus,
    machineId: MachineId
  ) => void;
  isPaused: boolean;
  onTogglePause: () => void;
}

const RISK_CATEGORIES: RiskCategory[] = [
  'NORMAL',
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL',
];

const getRiskTone = (risk: RiskCategory) => {
  switch (risk) {
    case 'CRITICAL':
      return {
        badge: 'bg-telemetry-crimson/20 text-telemetry-crimson border-telemetry-crimson/50',
        bar: 'bg-telemetry-crimson',
        text: 'text-telemetry-crimson',
      };
    case 'HIGH':
      return {
        badge: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
        bar: 'bg-orange-500',
        text: 'text-orange-400',
      };
    case 'MEDIUM':
      return {
        badge: 'bg-telemetry-amber/20 text-telemetry-amber border-telemetry-amber/40',
        bar: 'bg-telemetry-amber',
        text: 'text-telemetry-amber',
      };
    case 'LOW':
      return {
        badge: 'bg-[#140F22] text-[#A78BFA] border-[#7C3AED]/45',
        bar: 'bg-[#7C3AED]',
        text: 'text-[#A78BFA]',
      };
    case 'NORMAL':
      return {
        badge: 'bg-telemetry-emerald/15 text-telemetry-emerald border-telemetry-emerald/35',
        bar: 'bg-telemetry-emerald',
        text: 'text-telemetry-emerald',
      };
  }
};

export const AIIntelligenceDashboard: React.FC<
  AIIntelligenceDashboardProps
> = ({
  machines,
  selectedMachineId,
  onSelectMachine,
  intelligenceList,
  selectedIntelligence,
  intelligenceSummary,
  maintenanceRecommendations,
  machineScenarios,
  onInjectScenario,
  onUpdateMaintenanceStatus,
  isPaused,
  onTogglePause,
}) => {
  const allRecentDetections = intelligenceList.flatMap(
    (item) => item.activeAnomalies
  );

  return (
    <div className="space-y-6">
      {/* Unified Divided Diagnostic Summary Strip */}
      <section className="rounded-xl bg-[#0A0713] border border-[#1D182B] overflow-hidden">
        <div className="px-5 py-3 bg-[#110D1B]/70 border-b border-[#1D182B] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#7C3AED]" />
            <span className="text-xs font-semibold text-[#F4F2FA]">
              Explainable Rule &amp; Derivative Anomaly Engine (Simulated Telemetry)
            </span>
          </div>
          <button
            type="button"
            onClick={onTogglePause}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-[#0A0713] border border-[#262038] text-[#F4F2FA] hover:border-[#7C3AED]"
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5 text-[#A78BFA]" />}
            <span>{isPaused ? 'Resume Telemetry' : 'Pause Telemetry'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-[#1D182B]">
          <div className="px-5 py-4">
            <div className="text-xs text-[#9A94B0]">Machines at Risk</div>
            <div className="font-mono text-2xl font-bold text-telemetry-amber mt-1">
              {intelligenceSummary.machinesAtRiskCount} / {machines.length}
            </div>
          </div>
          <div className="px-5 py-4">
            <div className="text-xs text-[#9A94B0]">Critical Machines</div>
            <div className="font-mono text-2xl font-bold text-telemetry-crimson mt-1">
              {intelligenceSummary.criticalMachineCount}
            </div>
          </div>
          <div className="px-5 py-4">
            <div className="text-xs text-[#9A94B0]">Active Rule Detections</div>
            <div className="font-mono text-2xl font-bold text-[#F4F2FA] mt-1">
              {intelligenceSummary.activeAnomaliesCount}
            </div>
          </div>
          <div className="px-5 py-4">
            <div className="text-xs text-[#9A94B0]">Mean Anomaly Score</div>
            <div className="font-mono text-2xl font-bold text-[#A78BFA] mt-1">
              {intelligenceSummary.averageAnomalyScore}/100
            </div>
          </div>
          <div className="px-5 py-4 col-span-2 sm:col-span-1">
            <div className="text-xs text-[#9A94B0]">Open Work Orders</div>
            <div className="font-mono text-2xl font-bold text-telemetry-emerald mt-1">
              {intelligenceSummary.openMaintenanceCount}
            </div>
          </div>
        </div>
      </section>

      {/* Main Analytical Workspace: Left 7 Cols Fleet Health Comparison, Right 5 Cols Risk Distribution & Detection Timeline */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-7 rounded-xl bg-[#0A0713] border border-[#1D182B] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#1D182B]">
            <h3 className="font-sans font-semibold text-base text-[#F4F2FA]">
              Fleet Health &amp; Anomaly Index Comparison
            </h3>
            <p className="text-xs text-[#9A94B0] mt-0.5">
              Click any row to load its full sensor evidence and fault simulator below
            </p>
          </div>

          <div className="divide-y divide-[#1D182B]">
            {intelligenceList.map((intel) => {
              const isSelected = intel.machineId === selectedMachineId;
              const tone = getRiskTone(intel.riskCategory);
              return (
                <button
                  key={intel.machineId}
                  type="button"
                  onClick={() => onSelectMachine(intel.machineId)}
                  className={`w-full text-left px-5 py-3.5 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#140F22] border-l-2 border-l-[#7C3AED]'
                      : 'hover:bg-[#110D1B]/60'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#A78BFA]">
                        {intel.machineId}
                      </span>
                      <span className="font-sans font-semibold text-sm text-[#F4F2FA]">
                        {intel.machineName}
                      </span>
                      <span
                        className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded border ${tone.badge}`}
                      >
                        {intel.riskCategory}
                      </span>
                    </div>
                    <div className="text-xs text-[#9A94B0] mt-1 truncate">
                      {intel.primaryFaultIndicator}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    <div className="w-24">
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-[#9A94B0]">Health</span>
                        <span className="text-telemetry-emerald font-bold">{intel.healthScore}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#05030A] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-telemetry-emerald"
                          style={{ width: `${intel.healthScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="w-24">
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-[#9A94B0]">Anomaly</span>
                        <span className={`font-bold ${tone.text}`}>{intel.anomalyScore}</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#05030A] rounded-full overflow-hidden">
                        <div
                          className={`h-full ${tone.bar}`}
                          style={{ width: `${intel.anomalyScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 5 Cols: Risk Distribution + Detection Timeline */}
        <div className="xl:col-span-5 space-y-5">
          <div className="rounded-xl bg-[#0A0713] border border-[#1D182B] p-5 space-y-3">
            <h3 className="font-sans font-semibold text-base text-[#F4F2FA]">
              Risk Category Distribution
            </h3>
            <div className="space-y-2.5">
              {RISK_CATEGORIES.map((cat) => {
                const count = intelligenceSummary.riskDistribution[cat];
                const pct = Math.round((count / machines.length) * 100);
                const tone = getRiskTone(cat);
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-mono font-semibold ${tone.text}`}>{cat}</span>
                      <span className="font-mono text-[#9A94B0]">
                        {count} {count === 1 ? 'machine' : 'machines'} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#05030A] overflow-hidden">
                      <div
                        className={`h-full ${tone.bar}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl bg-[#0A0713] border border-[#1D182B] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#1D182B] flex items-center justify-between">
              <h3 className="font-sans font-semibold text-sm text-[#F4F2FA]">
                Live Anomaly Detection Timeline
              </h3>
              <span className="font-mono text-xs text-[#A78BFA]">
                {allRecentDetections.length} active
              </span>
            </div>
            <div className="divide-y divide-[#1D182B] max-h-60 overflow-y-auto">
              {allRecentDetections.length === 0 ? (
                <div className="p-5 text-xs text-[#9A94B0] text-center">
                  No active anomaly rules triggered.
                </div>
              ) : (
                allRecentDetections.map((det) => (
                  <button
                    key={det.id}
                    type="button"
                    onClick={() => onSelectMachine(det.machineId)}
                    className="w-full text-left px-5 py-3 hover:bg-[#110D1B] transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#A78BFA] font-semibold inline-flex items-center gap-1">
                        {det.machineId} {det.machineName}
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                      <span
                        className={
                          det.severity === 'CRITICAL'
                            ? 'text-telemetry-crimson font-semibold'
                            : 'text-telemetry-amber font-semibold'
                        }
                      >
                        {det.severity} • {det.detectedAt}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-[#F4F2FA] mt-0.5">
                      {det.title}
                    </div>
                    <div className="text-xs font-mono text-[#9A94B0] mt-0.5">
                      {det.measuredValue} (Limit: {det.expectedThreshold})
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostic Inspector + Fault Injection Simulator */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
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
      </div>

      {/* Predictive Maintenance Work Orders */}
      <PredictiveMaintenanceCentre
        recommendations={maintenanceRecommendations}
        selectedMachineId={selectedMachineId}
        onSelectMachine={onSelectMachine}
        onUpdateStatus={onUpdateMaintenanceStatus}
      />
    </div>
  );
};
