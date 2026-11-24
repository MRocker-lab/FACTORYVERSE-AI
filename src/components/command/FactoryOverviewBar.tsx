import React from 'react';
import {
  Pause,
  Play,
  AlertTriangle,
  OctagonAlert,
  CheckCircle2,
  Zap,
  Activity,
} from 'lucide-react';
import { FactoryOverviewMetrics, MachineTelemetry } from '../../types/telemetry';

interface FactoryOverviewBarProps {
  overview: FactoryOverviewMetrics;
  machines?: MachineTelemetry[];
  isPaused: boolean;
  onTogglePause: () => void;
  activeFilter: 'ALL' | 'RUNNING' | 'WARNING' | 'CRITICAL';
  onSelectFilter: (filter: 'ALL' | 'RUNNING' | 'WARNING' | 'CRITICAL') => void;
}

/**
 * Radial SVG OEE / Health Gauge ring for instant visual comprehension
 */
const RadialMiniGauge: React.FC<{ value: number; color: string }> = ({
  value,
  color,
}) => {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

  return (
    <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
      <svg className="w-11 h-11 -rotate-90" viewBox="0 0 44 44">
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="rgba(194, 214, 168, 0.12)"
          strokeWidth="3.5"
        />
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500"
        />
      </svg>
      <span className="absolute font-mono text-[10px] font-bold text-[#F0F3EA] tabular-nums">
        {Math.round(value)}%
      </span>
    </div>
  );
};

export const FactoryOverviewBar: React.FC<FactoryOverviewBarProps> = ({
  overview,
  isPaused,
  onTogglePause,
  activeFilter,
  onSelectFilter,
}) => {
  const isCriticalPlantState = overview.criticalCount > 0;
  const isWarningPlantState =
    !isCriticalPlantState && overview.warningCount > 0;
  const powerPct = Math.min(100, Math.round((overview.totalPowerKw / 224) * 100));

  return (
    <section className="rounded-2xl surface-obsidian overflow-hidden">
      {/* Top Bar: Plant Condition Telemetry Header + Segmented Status Filter + Stream Control */}
      <div className="px-5 py-3.5 bg-gradient-to-r from-[#151F19]/90 via-[#131D17]/90 to-[#151F19]/90 border-b border-white/[0.07] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          {isCriticalPlantState ? (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-telemetry-crimson/15 text-telemetry-crimson border border-telemetry-crimson/40 shadow-[0_0_20px_-4px_rgba(239,68,68,0.4)]">
              <span className="w-2 h-2 rounded-full bg-telemetry-crimson animate-ping" />
              <OctagonAlert className="w-3.5 h-3.5" />
              <span>
                CRITICAL THRESHOLD BREACH — {overview.criticalCount}{' '}
                {overview.criticalCount === 1 ? 'WORKCELL' : 'WORKCELLS'}
              </span>
            </span>
          ) : isWarningPlantState ? (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-telemetry-amber/15 text-telemetry-amber border border-telemetry-amber/40">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>
                ADVISORY DRIFT ACTIVE — {overview.warningCount}{' '}
                {overview.warningCount === 1 ? 'WORKCELL' : 'WORKCELLS'}
              </span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-telemetry-emerald/15 text-telemetry-emerald border border-telemetry-emerald/35">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>ALL WORKCELLS NOMINAL</span>
            </span>
          )}

          <div className="hidden sm:flex items-center gap-2 text-xs text-[#A1ADA0] pl-1">
            <Activity className="w-3.5 h-3.5 text-[#C2D6A8]" />
            <span>Sync Clock:</span>
            <span className="font-mono font-semibold text-[#F0F3EA] tabular-nums bg-[#0C1210] px-2 py-0.5 rounded border border-white/[0.06]">
              {overview.lastTickTimestamp}
            </span>
          </div>
        </div>

        {/* Right Controls: Quick Filter Segmented Control + Stream Pause/Resume */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="inline-flex items-center p-0.5 rounded-lg bg-[#0C1210] border border-white/[0.07]">
            {(
              [
                { id: 'ALL', label: `All (${overview.totalMachines})` },
                { id: 'RUNNING', label: `Nominal (${overview.runningCount})` },
                { id: 'WARNING', label: `Warn (${overview.warningCount})` },
                { id: 'CRITICAL', label: `Crit (${overview.criticalCount})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectFilter(tab.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  activeFilter === tab.id
                    ? 'bg-[#7EA46C] text-white shadow-sm'
                    : 'text-[#A1ADA0] hover:text-[#F0F3EA]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onTogglePause}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isPaused
                ? 'bg-telemetry-emerald/15 border-telemetry-emerald/45 text-telemetry-emerald hover:bg-telemetry-emerald/25'
                : 'bg-[#140F23] border-[#7EA46C]/45 text-[#F0F3EA] hover:bg-[#1C1530] hover:border-[#C2D6A8]'
            }`}
          >
            {isPaused ? (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume Telemetry</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 text-[#C2D6A8]" />
                <span>Pause Stream</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 6-Column High-Precision Telemetry Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.06]">
        {/* 1. Total Fleet Distribution Bar */}
        <button
          type="button"
          onClick={() => onSelectFilter('ALL')}
          className={`px-5 py-4 text-left transition-colors group ${
            activeFilter === 'ALL'
              ? 'bg-[#7EA46C]/[0.08]'
              : 'hover:bg-white/[0.02]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A1ADA0]">
              Active Fleet
            </span>
            <span className="text-[11px] font-mono text-[#C2D6A8]">
              100% Linked
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold text-[#F0F3EA] tabular-nums tracking-tight">
              {overview.totalMachines}
            </span>
            <span className="text-xs text-[#A1ADA0]">Workcells</span>
          </div>
          {/* Multi-segment fleet health distribution bar */}
          <div className="mt-3 w-full h-1.5 rounded-full bg-[#0C1210] overflow-hidden flex gap-0.5">
            {overview.runningCount > 0 && (
              <div
                className="h-full bg-telemetry-emerald transition-all duration-500"
                style={{
                  width: `${(overview.runningCount / overview.totalMachines) * 100}%`,
                }}
              />
            )}
            {overview.warningCount > 0 && (
              <div
                className="h-full bg-telemetry-amber transition-all duration-500"
                style={{
                  width: `${(overview.warningCount / overview.totalMachines) * 100}%`,
                }}
              />
            )}
            {overview.criticalCount > 0 && (
              <div
                className="h-full bg-telemetry-crimson transition-all duration-500"
                style={{
                  width: `${(overview.criticalCount / overview.totalMachines) * 100}%`,
                }}
              />
            )}
          </div>
        </button>

        {/* 2. Running Nominal */}
        <button
          type="button"
          onClick={() =>
            onSelectFilter(activeFilter === 'RUNNING' ? 'ALL' : 'RUNNING')
          }
          className={`px-5 py-4 text-left transition-colors ${
            activeFilter === 'RUNNING'
              ? 'bg-telemetry-emerald/[0.08]'
              : 'hover:bg-white/[0.02]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A1ADA0]">
              Nominal Cells
            </span>
            <span className="w-2 h-2 rounded-full bg-telemetry-emerald shadow-[0_0_8px_#10B981]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold text-telemetry-emerald tabular-nums tracking-tight">
              {overview.runningCount}
            </span>
            <span className="text-xs text-[#A1ADA0]">
              / {overview.totalMachines} online
            </span>
          </div>
          <div className="mt-2.5 text-xs text-[#A1ADA0] truncate">
            Optimal thermal &amp; RMS envelope
          </div>
        </button>

        {/* 3. Warning Advisory */}
        <button
          type="button"
          onClick={() =>
            onSelectFilter(activeFilter === 'WARNING' ? 'ALL' : 'WARNING')
          }
          className={`px-5 py-4 text-left transition-colors ${
            activeFilter === 'WARNING'
              ? 'bg-telemetry-amber/[0.08]'
              : 'hover:bg-white/[0.02]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A1ADA0]">
              Warning Drift
            </span>
            <span className="w-2 h-2 rounded-full bg-telemetry-amber shadow-[0_0_8px_#F59E0B]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold text-telemetry-amber tabular-nums tracking-tight">
              {overview.warningCount}
            </span>
            <span className="text-xs text-[#A1ADA0]">Advisory state</span>
          </div>
          <div className="mt-2.5 text-xs text-[#A1ADA0] truncate">
            Approaching upper limit
          </div>
        </button>

        {/* 4. Critical Breach */}
        <button
          type="button"
          onClick={() =>
            onSelectFilter(activeFilter === 'CRITICAL' ? 'ALL' : 'CRITICAL')
          }
          className={`px-5 py-4 text-left transition-colors ${
            activeFilter === 'CRITICAL'
              ? 'bg-telemetry-crimson/[0.12]'
              : 'hover:bg-white/[0.02]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A1ADA0]">
              Critical Units
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                overview.criticalCount > 0
                  ? 'bg-telemetry-crimson animate-ping'
                  : 'bg-white/20'
              }`}
            />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold text-telemetry-crimson tabular-nums tracking-tight">
              {overview.criticalCount}
            </span>
            <span className="text-xs font-mono text-[#A1ADA0]">
              ({overview.activeAlertsCount} alerts)
            </span>
          </div>
          <div className="mt-2.5 text-xs text-[#A1ADA0] truncate">
            {overview.criticalCount > 0
              ? 'Immediate intervention req.'
              : 'Zero critical breaches'}
          </div>
        </button>

        {/* 5. Fleet OEE & Mean Health with Radial Gauge */}
        <div className="px-5 py-4 flex items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A1ADA0] block">
              Simulated OEE
            </span>
            <span className="font-mono text-2xl sm:text-3xl font-bold text-[#F0F3EA] tabular-nums tracking-tight mt-1 block">
              {overview.overallEfficiency.toFixed(1)}%
            </span>
            <span className="text-xs text-telemetry-emerald mt-1 block">
              Health Index: {overview.averageHealth}%
            </span>
          </div>
          <RadialMiniGauge
            value={overview.averageHealth}
            color={
              overview.averageHealth >= 80
                ? '#10B981'
                : overview.averageHealth >= 60
                ? '#F59E0B'
                : '#EF4444'
            }
          />
        </div>

        {/* 6. Active Power Demand & Load Bar */}
        <div className="px-5 py-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A1ADA0]">
              Power Demand
            </span>
            <span className="text-xs font-mono text-[#C2D6A8] flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {powerPct}%
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-mono text-2xl sm:text-3xl font-bold text-[#F0F3EA] tabular-nums tracking-tight">
              {overview.totalPowerKw.toFixed(1)}
            </span>
            <span className="font-mono text-xs text-[#A1ADA0]">/ 224 kW</span>
          </div>
          <div className="mt-3 w-full h-1.5 rounded-full bg-[#0C1210] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#7EA46C] to-[#C2D6A8] transition-all duration-500"
              style={{ width: `${powerPct}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
