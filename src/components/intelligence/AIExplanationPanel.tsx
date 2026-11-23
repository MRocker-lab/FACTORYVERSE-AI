import React from 'react';
import {
  AlertTriangle,
  OctagonAlert,
  CheckCircle2,
} from 'lucide-react';
import { MachineHealthIntelligence, RiskCategory } from '../../types/intelligence';

interface AIExplanationPanelProps {
  intelligence: MachineHealthIntelligence;
}

const getRiskBadgeClasses = (risk: RiskCategory) => {
  switch (risk) {
    case 'CRITICAL':
      return 'bg-telemetry-crimson/15 text-telemetry-crimson border-telemetry-crimson/40';
    case 'HIGH':
      return 'bg-orange-500/15 text-orange-400 border-orange-500/40';
    case 'MEDIUM':
      return 'bg-telemetry-amber/15 text-telemetry-amber border-telemetry-amber/40';
    case 'LOW':
      return 'bg-[#140F22] text-[#A78BFA] border-[#7C3AED]/40';
    case 'NORMAL':
      return 'bg-telemetry-emerald/15 text-telemetry-emerald border-telemetry-emerald/35';
  }
};

export const AIExplanationPanel: React.FC<AIExplanationPanelProps> = ({
  intelligence,
}) => {
  const { activeAnomalies, contributingSensors, ratesOfChange } = intelligence;

  return (
    <div className="rounded-2xl surface-obsidian overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-[#130E21]/85 via-[#0C0816]/85 to-[#130E21]/85 border-b border-white/[0.07] flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="font-sans font-semibold text-base text-[#F4F2FA]">
              Diagnostic Root-Cause Inspector — {intelligence.machineId} ({intelligence.machineName})
            </h3>
            <span
              className={`text-xs font-mono font-semibold px-2 py-0.5 rounded border ${getRiskBadgeClasses(
                intelligence.riskCategory
              )}`}
            >
              Risk: {intelligence.riskCategory}
            </span>
          </div>
          <p className="text-xs text-[#9A94B0] mt-0.5">
            Rule &amp; rate-of-change diagnostic evaluation on simulated telemetry • Thermal slope:{' '}
            <span className="font-mono text-[#F4F2FA]">
              {ratesOfChange.tempDeltaPerSec >= 0 ? '+' : ''}
              {ratesOfChange.tempDeltaPerSec} °C/s
            </span>
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div>
            <span className="text-[#9A94B0]">Health: </span>
            <strong className="text-telemetry-emerald">{intelligence.healthScore}%</strong>
          </div>
          <div>
            <span className="text-[#9A94B0]">Anomaly Index: </span>
            <strong className="text-[#A78BFA]">{intelligence.anomalyScore}/100</strong>
          </div>
        </div>
      </div>

      {/* Active Anomaly Findings */}
      <div className="p-5 space-y-4 flex-1">
        {activeAnomalies.length === 0 ? (
          <div className="rounded-lg bg-[#05030A] border border-[#1D182B] p-5 flex items-center gap-3.5">
            <CheckCircle2 className="w-6 h-6 text-telemetry-emerald shrink-0" />
            <div>
              <div className="font-sans font-semibold text-sm text-[#F4F2FA]">
                No Active Anomaly Rules Triggered on {intelligence.machineId}
              </div>
              <p className="text-xs text-[#9A94B0] mt-0.5 leading-relaxed">
                {intelligence.detectionExplanation}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            {activeAnomalies.map((anomaly) => {
              const isCrit = anomaly.severity === 'CRITICAL';
              return (
                <div
                  key={anomaly.id}
                  className={`rounded-lg border p-4 space-y-3 ${
                    isCrit
                      ? 'bg-[#12080D] border-telemetry-crimson/50'
                      : 'bg-[#0E0A18] border-[#262038]'
                  }`}
                >
                  {/* Top Bar: Rule Name + Triggered Sensor + Measured vs Limit */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#1D182B]">
                    <div className="flex items-center gap-2">
                      {isCrit ? (
                        <OctagonAlert className="w-4 h-4 text-telemetry-crimson shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-telemetry-amber shrink-0" />
                      )}
                      <span className="font-sans font-semibold text-sm text-[#F4F2FA]">
                        {anomaly.title}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-[#9A94B0]">
                      +{anomaly.anomalyScoreContribution} pts • {anomaly.detectedAt}
                    </span>
                  </div>

                  {/* Structured Evidence Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#05030A] p-3 rounded-lg border border-[#1D182B]">
                    <div>
                      <span className="text-[#9A94B0] block">Trigger Sensor</span>
                      <span className="font-medium text-[#F4F2FA] mt-0.5 block">
                        {anomaly.triggerSensor}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#9A94B0] block">Measured Reading</span>
                      <span
                        className={`font-mono font-bold mt-0.5 block ${
                          isCrit ? 'text-telemetry-crimson' : 'text-telemetry-amber'
                        }`}
                      >
                        {anomaly.measuredValue}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#9A94B0] block">Applicable Threshold</span>
                      <span className="font-mono text-telemetry-emerald mt-0.5 block">
                        {anomaly.expectedThreshold}
                      </span>
                    </div>
                  </div>

                  {/* Engineer Reasoning Rows */}
                  <div className="space-y-2 text-xs leading-relaxed">
                    <div>
                      <span className="font-semibold text-[#9A94B0]">What happened: </span>
                      <span className="text-[#F4F2FA]">{anomaly.whatHappened}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-telemetry-amber">Operational risk: </span>
                      <span className="text-[#F4F2FA]">{anomaly.whyDangerous}</span>
                    </div>
                    <div className="pt-1">
                      <span className="font-semibold text-[#A78BFA]">Recommended action: </span>
                      <span className="text-[#F4F2FA] font-medium">{anomaly.operatorAction}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Compact Sensor Evidence Table */}
        <div className="pt-2">
          <div className="text-xs font-semibold text-[#9A94B0] mb-2">
            Live Sensor Evidence Table ({intelligence.machineId})
          </div>
          <div className="overflow-x-auto rounded-lg border border-[#1D182B] bg-[#05030A]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1D182B] text-[#9A94B0]">
                  <th className="py-2 px-3 font-medium">Channel</th>
                  <th className="py-2 px-3 font-medium">Measured</th>
                  <th className="py-2 px-3 font-medium">Expected Envelope</th>
                  <th className="py-2 px-3 font-medium text-right">State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1D182B]/60">
                {contributingSensors.map((s) => (
                  <tr key={s.sensor}>
                    <td className="py-2 px-3 text-[#F4F2FA] font-medium">{s.label}</td>
                    <td className="py-2 px-3 font-mono font-semibold text-[#F4F2FA]">
                      {s.measuredValue}
                    </td>
                    <td className="py-2 px-3 font-mono text-[#9A94B0]">{s.expectedRange}</td>
                    <td className="py-2 px-3 text-right font-mono">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                          s.severity === 'CRITICAL'
                            ? 'bg-telemetry-crimson/20 text-telemetry-crimson'
                            : s.severity === 'ELEVATED'
                            ? 'bg-telemetry-amber/20 text-telemetry-amber'
                            : 'text-telemetry-emerald'
                        }`}
                      >
                        {s.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
