import React from 'react';
import {
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';
import { MachineId } from '../../types/telemetry';
import {
  MaintenancePriority,
  MaintenanceWorkOrderStatus,
  PredictiveMaintenanceRecommendation,
} from '../../types/intelligence';

interface PredictiveMaintenanceCentreProps {
  recommendations: PredictiveMaintenanceRecommendation[];
  selectedMachineId: MachineId;
  onSelectMachine: (id: MachineId) => void;
  onUpdateStatus: (
    recommendationId: string,
    status: MaintenanceWorkOrderStatus,
    machineId: MachineId
  ) => void;
}

const getPriorityBadge = (priority: MaintenancePriority) => {
  switch (priority) {
    case 'IMMEDIATE':
      return 'bg-telemetry-crimson/20 text-telemetry-crimson border-telemetry-crimson/50';
    case 'HIGH':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
    case 'MEDIUM':
      return 'bg-telemetry-amber/20 text-telemetry-amber border-telemetry-amber/40';
    case 'LOW':
      return 'bg-[#140F22] text-[#C2D6A8] border-[#7EA46C]/45';
  }
};

const WORK_ORDER_STATUSES: MaintenanceWorkOrderStatus[] = [
  'OPEN',
  'ACKNOWLEDGED',
  'IN_PROGRESS',
  'RESOLVED',
];

export const PredictiveMaintenanceCentre: React.FC<
  PredictiveMaintenanceCentreProps
> = ({
  recommendations,
  selectedMachineId,
  onSelectMachine,
  onUpdateStatus,
}) => {
  return (
    <div className="rounded-2xl surface-obsidian overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-[#151F19]/85 via-[#111A15]/85 to-[#151F19]/85 border-b border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="font-sans font-semibold text-base text-[#F0F3EA]">
              Predictive Maintenance Work-Order Dispatch
            </h3>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#140F22] text-[#C2D6A8] border border-[#7EA46C]/40">
              {recommendations.filter((r) => r.status !== 'RESOLVED').length} Open Orders
            </span>
          </div>
          <p className="text-xs text-[#A1ADA0] mt-0.5">
            Simulated inspection recommendations generated from live sensor drift. Administrative work-order status is tracked separately from simulated machine recovery.
          </p>
        </div>
      </div>

      {/* Structured Work-Order Ledger */}
      {recommendations.length === 0 ? (
        <div className="p-8 text-center space-y-2">
          <CheckCircle2 className="w-7 h-7 text-telemetry-emerald mx-auto" />
          <div className="font-sans font-semibold text-sm text-[#F0F3EA]">
            No Active Maintenance Work Orders
          </div>
          <p className="text-xs text-[#A1ADA0] max-w-md mx-auto">
            All 6 machines are operating within nominal parameters.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#26332D]">
          {recommendations.map((rec) => {
            const isSelected = rec.machineId === selectedMachineId;
            return (
              <div
                key={rec.id}
                className={`p-5 transition-colors ${
                  rec.status === 'RESOLVED'
                    ? 'bg-[#0C1210]/60 opacity-75'
                    : isSelected
                    ? 'bg-[#17211C]'
                    : 'hover:bg-[#0D0A17]'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left: Work Order Details & Sensor Evidence */}
                  <div className="space-y-2.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span
                        className={`text-xs font-mono font-semibold px-2 py-0.5 rounded border ${getPriorityBadge(
                          rec.priority
                        )}`}
                      >
                        {rec.priority}
                      </span>
                      <button
                        type="button"
                        onClick={() => onSelectMachine(rec.machineId)}
                        className="text-sm font-mono font-bold text-[#C2D6A8] hover:underline inline-flex items-center gap-1"
                      >
                        {rec.machineId} {rec.machineName}
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-mono text-[#A1ADA0]">
                        {rec.bay} • Work Order #{rec.id}
                      </span>
                      {!rec.isConditionActive && (
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-telemetry-emerald/15 text-telemetry-emerald">
                          Telemetry Recovered
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="font-sans font-semibold text-base text-[#F0F3EA]">
                        {rec.title}
                      </h4>
                      <p className="text-xs text-[#F0F3EA]/90 mt-1 leading-relaxed">
                        <span className="text-[#A1ADA0] font-medium">Recommended Action: </span>
                        {rec.recommendedAction}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                      <div>
                        <span className="text-[#A1ADA0]">Inspection Window: </span>
                        <span className="font-mono text-amber-300 font-medium">
                          {rec.suggestedInspectionWindow}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#A1ADA0]">Operational Impact: </span>
                        <span className="text-[#F0F3EA]">{rec.estimatedOperationalImpact}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-xs text-[#A1ADA0] mr-1">Sensor Evidence:</span>
                      {rec.triggeringSensors.map((s, idx) => (
                        <span
                          key={idx}
                          className="text-xs font-mono px-2 py-0.5 rounded bg-[#0C1210] border border-[#26332D] text-[#F0F3EA]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right: Work Order Status Controls */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="text-[#A1ADA0]">
                        Anomaly: <strong className="text-[#F0F3EA]">{rec.anomalyScore}/100</strong>
                      </span>
                      <span className="text-[#A1ADA0]">
                        Health: <strong className="text-telemetry-emerald">{rec.healthScore}%</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {WORK_ORDER_STATUSES.map((st) => {
                        const active = rec.status === st;
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => onUpdateStatus(rec.id, st, rec.machineId)}
                            className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                              active
                                ? st === 'RESOLVED'
                                  ? 'bg-telemetry-emerald/20 border-telemetry-emerald text-telemetry-emerald'
                                  : 'bg-[#140F22] border-[#7EA46C] text-[#F0F3EA]'
                                : 'bg-[#0C1210] border-[#26332D] text-[#A1ADA0] hover:text-[#F0F3EA]'
                            }`}
                          >
                            {st === 'OPEN'
                              ? 'Open'
                              : st === 'ACKNOWLEDGED'
                              ? 'Acknowledge'
                              : st === 'IN_PROGRESS'
                              ? 'Start Work'
                              : 'Resolve'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
