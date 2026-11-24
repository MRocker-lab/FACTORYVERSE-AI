import React from 'react';
import {
  AlertTriangle,
  OctagonAlert,
  CheckCircle2,
  ArrowUpRight,
  Check,
} from 'lucide-react';
import { MachineId, MachineTelemetry, OperationalAlert } from '../../types/telemetry';

interface AlertsPanelProps {
  alerts: OperationalAlert[];
  machines?: MachineTelemetry[];
  selectedMachineId: MachineId;
  onSelectMachine: (id: MachineId) => void;
  onAcknowledgeAlert: (alertId: string) => void;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({
  alerts,
  machines,
  selectedMachineId,
  onSelectMachine,
  onAcknowledgeAlert,
}) => {
  const criticalAlerts = alerts.filter((a) => a.severity === 'CRITICAL');
  const warningAlerts = alerts.filter((a) => a.severity === 'WARNING');
  const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length;

  const affectedMachineIds = new Set(alerts.map((a) => a.machineId));
  const criticalMachineCount = machines
    ? machines.filter((m) => m.status === 'CRITICAL').length
    : new Set(criticalAlerts.map((a) => a.machineId)).size;

  return (
    <div className="rounded-2xl surface-obsidian flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 bg-gradient-to-r from-[#151F19]/85 via-[#111A15]/85 to-[#151F19]/85 border-b border-white/[0.07] flex items-center justify-between gap-2">
        <div>
          <h2 className="font-sans font-semibold text-base text-[#F0F3EA]">
            Active Incidents &amp; Sensor Alerts
          </h2>
          <p className="text-xs text-[#A1ADA0] mt-0.5">
            <span className="font-mono text-[#F0F3EA] font-semibold tabular-nums">
              {alerts.length}
            </span>{' '}
            sensor {alerts.length === 1 ? 'alert' : 'alerts'} across{' '}
            <span className="font-mono text-[#F0F3EA] font-semibold tabular-nums">
              {affectedMachineIds.size}
            </span>{' '}
            {affectedMachineIds.size === 1 ? 'machine' : 'machines'} ({criticalMachineCount} critical{' '}
            {criticalMachineCount === 1 ? 'unit' : 'units'})
          </p>
        </div>

        {/* Severity Badges */}
        <div className="flex items-center gap-1.5 shrink-0">
          {criticalAlerts.length > 0 && (
            <span className="px-2 py-0.5 rounded-md text-xs font-mono font-semibold bg-telemetry-crimson/20 text-telemetry-crimson border border-telemetry-crimson/40">
              {criticalAlerts.length} Crit
            </span>
          )}
          {warningAlerts.length > 0 && (
            <span className="px-2 py-0.5 rounded-md text-xs font-mono font-semibold bg-telemetry-amber/20 text-telemetry-amber border border-telemetry-amber/40">
              {warningAlerts.length} Warn
            </span>
          )}
        </div>
      </div>

      {/* Alert Feed List */}
      <div className="p-4 flex-1 space-y-2.5 overflow-y-auto max-h-[430px]">
        {alerts.length === 0 ? (
          <div className="rounded-xl surface-well p-6 text-center space-y-2">
            <CheckCircle2 className="w-7 h-7 text-telemetry-emerald mx-auto" />
            <div className="font-sans font-semibold text-sm text-[#F0F3EA]">
              No Active Sensor Threshold Breaches
            </div>
            <p className="text-xs text-[#A1ADA0]">
              All 6 workcells (M-01 through M-06) are operating within nominal temperature, vibration, current, and torque limits.
            </p>
          </div>
        ) : (
          alerts.map((alert) => {
            const isCrit = alert.severity === 'CRITICAL';
            const isSelectedMachine = alert.machineId === selectedMachineId;

            return (
              <div
                key={alert.id}
                className={`rounded-xl p-3.5 border relative overflow-hidden transition-all ${
                  alert.acknowledged
                    ? 'bg-[#0C1210]/60 border-white/[0.06] opacity-70'
                    : isCrit
                    ? 'bg-gradient-to-r from-telemetry-crimson/[0.12] via-[#0B0714] to-[#0B0714] border-telemetry-crimson/45'
                    : 'bg-gradient-to-r from-telemetry-amber/[0.10] via-[#0B0714] to-[#0B0714] border-telemetry-amber/40'
                } ${isSelectedMachine ? 'ring-1 ring-[#7EA46C]' : ''}`}
              >
                {/* Left severity accent bar */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 ${
                    isCrit ? 'bg-telemetry-crimson' : 'bg-telemetry-amber'
                  }`}
                />

                <div className="pl-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isCrit ? (
                        <OctagonAlert className="w-4 h-4 text-telemetry-crimson shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-telemetry-amber shrink-0" />
                      )}
                      <span
                        className={`text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                          isCrit
                            ? 'bg-telemetry-crimson/20 text-telemetry-crimson'
                            : 'bg-telemetry-amber/20 text-telemetry-amber'
                        }`}
                      >
                        {alert.severity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onSelectMachine(alert.machineId)}
                        className="text-xs font-mono font-semibold text-[#C2D6A8] hover:underline inline-flex items-center gap-0.5"
                      >
                        {alert.machineId} {alert.machineName}
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-[11px] font-mono text-[#A1ADA0] tabular-nums shrink-0">
                      {alert.timestamp}
                    </span>
                  </div>

                  <div className="mt-1.5">
                    <div className="text-sm font-semibold text-[#F0F3EA]">
                      {alert.title}
                    </div>
                    <p className="text-xs text-[#A1ADA0] mt-0.5 leading-relaxed">
                      {alert.description}
                    </p>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-white/[0.06] flex items-center justify-between gap-2 text-xs">
                    <div className="font-mono flex items-center gap-3 tabular-nums">
                      <span className="text-[#A1ADA0]">
                        Measured:{' '}
                        <strong
                          className={
                            isCrit ? 'text-telemetry-crimson' : 'text-telemetry-amber'
                          }
                        >
                          {alert.measuredValue}
                        </strong>
                      </span>
                      <span className="text-[#A1ADA0]">
                        Limit: {alert.thresholdValue}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onAcknowledgeAlert(alert.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                        alert.acknowledged
                          ? 'bg-telemetry-emerald/15 border-telemetry-emerald/40 text-telemetry-emerald'
                          : 'bg-[#140F23] border-white/[0.1] text-[#F0F3EA] hover:border-[#7EA46C]'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                      {alert.acknowledged ? 'Acknowledged' : 'Acknowledge'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Status Summary */}
      <div className="px-5 py-2.5 bg-[#0C1210] border-t border-white/[0.06] flex items-center justify-between text-xs text-[#A1ADA0]">
        <span>Unacknowledged: {unacknowledgedCount}</span>
        <span className="font-mono">Multi-sensor correlation active</span>
      </div>
    </div>
  );
};
