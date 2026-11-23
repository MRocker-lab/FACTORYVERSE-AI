import React from 'react';
import {
  Activity,
  Box,
  Cpu,
  BarChart3,
  Zap,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
  Radio,
  Sun,
  Moon,
  RefreshCw,
} from 'lucide-react';
import { NAVIGATION_ITEMS, NavSectionId, SurfaceTheme } from '../../types/navigation';
import { FactoryOverviewMetrics } from '../../types/telemetry';

interface AppShellProps {
  activeSection: NavSectionId;
  onSelectSection: (id: NavSectionId) => void;
  activeTheme: SurfaceTheme;
  isThemeOverridden: boolean;
  onToggleTheme: () => void;
  onResetThemeAuto: () => void;
  overviewMetrics?: FactoryOverviewMetrics;
  children: React.ReactNode;
}

const getNavIcon = (id: NavSectionId, className = 'w-4 h-4') => {
  switch (id) {
    case 'command-centre':
      return <Activity className={className} />;
    case 'digital-twin':
      return <Box className={className} />;
    case 'predictive-ai':
      return <Cpu className={className} />;
    case 'enterprise-analytics':
      return <BarChart3 className={className} />;
    case 'energy-sustainability':
      return <Zap className={className} />;
    case 'system-governance':
      return <ShieldCheck className={className} />;
  }
};

export const AppShell: React.FC<AppShellProps> = ({
  activeSection,
  onSelectSection,
  activeTheme,
  isThemeOverridden,
  onToggleTheme,
  onResetThemeAuto,
  overviewMetrics,
  children,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState(false);

  const isDark = activeTheme === 'dark-command';
  const currentNav =
    NAVIGATION_ITEMS.find((item) => item.id === activeSection) || NAVIGATION_ITEMS[0];

  const operationsNav = NAVIGATION_ITEMS.filter(
    (i) => i.category === 'REAL-TIME OPERATIONS'
  );
  const enterpriseNav = NAVIGATION_ITEMS.filter(
    (i) => i.category === 'ENTERPRISE INTELLIGENCE'
  );

  return (
    <div
      className={`min-h-screen flex flex-col lg:flex-row transition-colors duration-200 ${
        isDark
          ? 'bg-[#030206] text-[#F4F2FA]'
          : 'bg-enterprise-50 text-enterprise-900'
      }`}
    >
      {/* COMPACT INDUSTRIAL RAIL SIDEBAR */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 bg-[#0A0713] border-r border-[#1D182B] text-[#F4F2FA] transition-all duration-200 select-none z-30 ${
          sidebarCollapsed ? 'w-16' : 'w-56'
        }`}
      >
        {/* Compact Brand Header (h-12) */}
        <div className="h-12 px-3.5 flex items-center justify-between border-b border-[#1D182B]">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-[#7C3AED] flex items-center justify-center shrink-0">
              <Radio className="w-4 h-4 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex items-baseline gap-1.5">
                <span className="font-sans font-bold tracking-tight text-sm text-[#F4F2FA]">
                  FACTORYVERSE
                </span>
                <span className="text-[10px] font-mono font-semibold text-[#A78BFA]">
                  AI
                </span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-1 rounded text-[#9A94B0] hover:text-[#F4F2FA] hover:bg-[#110D1B] transition-colors"
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto py-4 px-2.5 space-y-6">
          {/* Group 1: Operations */}
          <div>
            {!sidebarCollapsed && (
              <div className="px-2.5 mb-1.5 text-[11px] font-sans font-semibold uppercase tracking-wider text-[#9A94B0]/80">
                Operations
              </div>
            )}
            <nav className="space-y-0.5">
              {operationsNav.map((item) => {
                const isActive = item.id === activeSection;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectSection(item.id)}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={`w-full flex items-center ${
                      sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-2.5'
                    } py-2 rounded-lg text-[13px] font-medium transition-colors relative ${
                      isActive
                        ? 'bg-[#110D1B] text-[#F4F2FA]'
                        : 'text-[#9A94B0] hover:text-[#F4F2FA] hover:bg-[#110D1B]/60'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-[#7C3AED]" />
                    )}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`${
                          isActive ? 'text-[#A78BFA]' : 'text-[#9A94B0]'
                        } shrink-0`}
                      >
                        {getNavIcon(item.id)}
                      </span>
                      {!sidebarCollapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </div>
                    {!sidebarCollapsed && item.id === 'predictive-ai' && overviewMetrics && overviewMetrics.activeAlertsCount > 0 && (
                      <span className="text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#181226] text-[#A78BFA]">
                        {overviewMetrics.activeAlertsCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Group 2: Enterprise & Maintenance */}
          <div>
            {!sidebarCollapsed && (
              <div className="px-2.5 mb-1.5 text-[11px] font-sans font-semibold uppercase tracking-wider text-[#9A94B0]/80">
                Intelligence &amp; Ledger
              </div>
            )}
            <nav className="space-y-0.5">
              {enterpriseNav.map((item) => {
                const isActive = item.id === activeSection;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectSection(item.id)}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={`w-full flex items-center ${
                      sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-2.5'
                    } py-2 rounded-lg text-[13px] font-medium transition-colors relative ${
                      isActive
                        ? 'bg-[#110D1B] text-[#F4F2FA]'
                        : 'text-[#9A94B0] hover:text-[#F4F2FA] hover:bg-[#110D1B]/60'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-[#7C3AED]" />
                    )}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`${
                          isActive ? 'text-[#A78BFA]' : 'text-[#9A94B0]'
                        } shrink-0`}
                      >
                        {getNavIcon(item.id)}
                      </span>
                      {!sidebarCollapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Minimal Plant Telemetry Footer */}
        <div className="p-2.5 border-t border-[#1D182B]">
          {!sidebarCollapsed ? (
            <div className="px-2 py-1.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-telemetry-emerald" />
                <span className="text-[#9A94B0] font-medium">6 Workcells</span>
              </div>
              <span className="font-mono text-[11px] text-[#9A94B0]">
                1.5s cycle
              </span>
            </div>
          ) : (
            <div className="flex justify-center py-1">
              <span className="w-2 h-2 rounded-full bg-telemetry-emerald" />
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-16 lg:pb-0">
        {/* COMPACT TOP HEADER RIBBON (h-12) */}
        <header
          className={`sticky top-0 z-20 h-12 px-4 sm:px-6 flex items-center justify-between border-b backdrop-blur-md ${
            isDark
              ? 'bg-[#0A0713]/90 border-[#1D182B] text-[#F4F2FA]'
              : 'bg-white/95 border-enterprise-200 text-enterprise-900'
          }`}
        >
          {/* Left: Mobile Menu Trigger + Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className="lg:hidden p-1.5 rounded-lg bg-[#110D1B] border border-[#211B34] text-[#A78BFA]"
              aria-label="Toggle Menu"
            >
              <Radio className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs text-[#9A94B0] hidden sm:inline">
                Sector A/B
              </span>
              <span className="text-[#211B34] hidden sm:inline">/</span>
              <h1 className="font-sans font-semibold text-sm sm:text-base text-[#F4F2FA] truncate">
                {currentNav.label}
              </h1>
            </div>
          </div>

          {/* Right: Live Operational Metrics Strip + Surface Toggle */}
          <div className="flex items-center gap-4 shrink-0">
            {overviewMetrics && (
              <div className="hidden md:flex items-center gap-5 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#9A94B0]">Critical Machines:</span>
                  <span
                    className={`font-mono font-semibold ${
                      overviewMetrics.criticalCount > 0
                        ? 'text-telemetry-crimson'
                        : 'text-telemetry-emerald'
                    }`}
                  >
                    {overviewMetrics.criticalCount} / {overviewMetrics.totalMachines}
                  </span>
                </div>
                <div className="h-3.5 w-px bg-[#1D182B]" />
                <div className="flex items-center gap-1.5">
                  <span className="text-[#9A94B0]">Sensor Alerts:</span>
                  <span
                    className={`font-mono font-semibold ${
                      overviewMetrics.activeAlertsCount > 0
                        ? 'text-telemetry-amber'
                        : 'text-telemetry-emerald'
                    }`}
                  >
                    {overviewMetrics.activeAlertsCount}
                  </span>
                </div>
                <div className="h-3.5 w-px bg-[#1D182B]" />
                <div className="flex items-center gap-1.5">
                  <span className="text-[#9A94B0]">OEE:</span>
                  <span className="font-mono font-semibold text-[#F4F2FA]">
                    {overviewMetrics.overallEfficiency.toFixed(1)}%
                  </span>
                </div>
                <div className="h-3.5 w-px bg-[#1D182B]" />
                <div className="flex items-center gap-1.5">
                  <span className="text-[#9A94B0]">Power:</span>
                  <span className="font-mono font-semibold text-[#F4F2FA]">
                    {overviewMetrics.totalPowerKw.toFixed(1)} kW
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onToggleTheme}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#110D1B] hover:bg-[#1D182B] border border-[#211B34] text-[#F4F2FA] transition-colors"
                title="Switch surface mode"
              >
                {isDark ? (
                  <>
                    <Moon className="w-3.5 h-3.5 text-[#A78BFA]" />
                    <span className="hidden sm:inline">Obsidian</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span className="hidden sm:inline">Light</span>
                  </>
                )}
              </button>

              {isThemeOverridden && (
                <button
                  type="button"
                  onClick={onResetThemeAuto}
                  title="Reset to default theme"
                  className="p-1 rounded-lg bg-[#110D1B] border border-[#211B34] text-[#9A94B0] hover:text-[#F4F2FA]"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* MOBILE DRAWER OVERLAY */}
        {mobileDrawerOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black/75 backdrop-blur-sm"
              onClick={() => setMobileDrawerOpen(false)}
            />
            <div className="relative w-72 max-w-[85vw] bg-[#0A0713] border-r border-[#211B34] text-[#F4F2FA] flex flex-col z-10 p-4 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#211B34]">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#7C3AED] flex items-center justify-center">
                    <Radio className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-sans font-bold text-sm text-[#F4F2FA]">
                    FACTORYVERSE AI
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="text-xs px-2.5 py-1 rounded bg-[#110D1B] text-[#9A94B0]"
                >
                  Close
                </button>
              </div>

              <div className="space-y-4 overflow-y-auto">
                <div>
                  <div className="text-xs font-semibold text-[#9A94B0] mb-2">
                    Operations
                  </div>
                  <div className="space-y-1">
                    {operationsNav.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onSelectSection(item.id);
                          setMobileDrawerOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                          activeSection === item.id
                            ? 'bg-[#110D1B] text-[#F4F2FA] border-l-2 border-[#7C3AED]'
                            : 'text-[#9A94B0] hover:bg-[#110D1B]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {getNavIcon(item.id)}
                          <span>{item.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-[#9A94B0] mb-2">
                    Intelligence &amp; Ledger
                  </div>
                  <div className="space-y-1">
                    {enterpriseNav.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onSelectSection(item.id);
                          setMobileDrawerOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                          activeSection === item.id
                            ? 'bg-[#110D1B] text-[#F4F2FA] border-l-2 border-[#7C3AED]'
                            : 'text-[#9A94B0] hover:bg-[#110D1B]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {getNavIcon(item.id)}
                          <span>{item.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WIDE EXPANSIVE PAGE CANVAS */}
        <main className="flex-1">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-5">
            {children}
          </div>
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-[#0A0713]/95 backdrop-blur-lg border-t border-[#1D182B] px-2 py-1.5 flex items-center justify-around">
        {NAVIGATION_ITEMS.slice(0, 5).map((item) => {
          const isActive = item.id === activeSection;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectSection(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'text-[#A78BFA] bg-[#110D1B]'
                  : 'text-[#9A94B0] hover:text-[#F4F2FA]'
              }`}
            >
              {getNavIcon(item.id, 'w-4 h-4')}
              <span className="text-[11px] font-medium mt-0.5">
                {item.shortLabel}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
