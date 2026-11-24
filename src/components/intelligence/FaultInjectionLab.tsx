import React from 'react';
import { RotateCcw } from 'lucide-react';
import { MachineId, MachineTelemetry } from '../../types/telemetry';
import {
  FAULT_SCENARIOS,
  FaultScenarioId,
  MachineHealthIntelligence,
} from '../../types/intelligence';

interface FaultInjectionLabProps {
  machines: MachineTelemetry[];
  selectedMachineId: MachineId;
  onSelectMachine: (id: MachineId) => void;
  machineScenarios: Partial<Record<MachineId, FaultScenarioId>>;
  onInjectScenario: (machineId: MachineId, scenario: FaultScenarioId) => void;
  selectedIntelligence: MachineHealthIntelligence;
}

export const FaultInjectionLab: React.FC<FaultInjectionLabProps> = ({
  machines,
  selectedMachineId,
  onSelectMachine,
  machineScenarios,
  onInjectScenario,
  selectedIntelligence,
}) => {
  const activeScenario = machineScenarios[selectedMachineId] || 'DEFAULT';

  return (
    <div className="rounded-2xl surface-obsidian overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-[#151F19]/85 via-[#111A15]/85 to-[#151F19]/85 border-b border-white/[0.07] flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-sans font-semibold text-base text-[#F0F3EA]">
            Fault Injection &amp; Scenario Simulator
          </h3>
          <p className="text-xs text-[#A1ADA0] mt-0.5">
            Inject test conditions into {selectedMachineId} to verify closed-loop detection
          </p>
        </div>

        {activeScenario !== 'DEFAULT' && (
          <button
            type="button"
            onClick={() => onInjectScenario(selectedMachineId, 'DEFAULT')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-[#17211C] hover:bg-[#26332D] text-[#F0F3EA] border border-[#262038]"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#C2D6A8]" />
            <span>Reset Seed</span>
          </button>
        )}
      </div>

      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
        {/* Target Workcell Selector Strip */}
        <div>
          <div className="text-xs font-medium text-[#A1ADA0] mb-2">
            Target Workcell
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {machines.map((m) => {
              const isSel = m.id === selectedMachineId;
              const hasScenario =
                machineScenarios[m.id] && machineScenarios[m.id] !== 'DEFAULT';
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onSelectMachine(m.id)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-mono font-semibold border transition-colors flex items-center justify-center gap-1 ${
                    isSel
                      ? 'bg-[#140F22] border-[#7EA46C] text-[#F0F3EA]'
                      : 'bg-[#0C1210] border-[#26332D] text-[#A1ADA0] hover:text-[#F0F3EA]'
                  }`}
                >
                  <span>{m.id}</span>
                  {hasScenario && (
                    <span className="w-1.5 h-1.5 rounded-full bg-telemetry-amber" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 6 Scenario Rows */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-[#A1ADA0]">
            Select Simulation Profile
          </div>
          {FAULT_SCENARIOS.map((sc) => {
            const isActive = activeScenario === sc.id;
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => onInjectScenario(selectedMachineId, sc.id)}
                className={`w-full text-left rounded-lg p-3 border transition-colors ${
                  isActive
                    ? 'bg-[#140F22] border-[#7EA46C]'
                    : 'bg-[#0C1210] border-[#26332D] hover:border-[#2C2442]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-sans font-semibold text-sm text-[#F0F3EA]">
                    {sc.label}
                  </span>
                  <span
                    className={`text-xs font-mono font-semibold ${
                      isActive ? 'text-[#C2D6A8]' : 'text-[#A1ADA0]'
                    }`}
                  >
                    {isActive ? 'ACTIVE' : 'Apply →'}
                  </span>
                </div>
                <p className="text-xs text-[#A1ADA0] mt-1 leading-relaxed">
                  {sc.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Live Telemetry Response Summary */}
        <div className="rounded-lg bg-[#0C1210] border border-[#26332D] px-3.5 py-2.5 flex items-center justify-between text-xs font-mono">
          <span className="text-[#A1ADA0]">
            Active: <strong className="text-[#F0F3EA]">{activeScenario.replace(/_/g, ' ')}</strong>
          </span>
          <span className="text-[#A1ADA0]">
            Triggers: <strong className="text-[#C2D6A8]">{selectedIntelligence.activeAnomalies.length}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
