import React from 'react';
import { AppShell } from './components/layout/AppShell';
import { FoundationPreview } from './components/FoundationPreview';
import { CommandCentreView } from './components/command/CommandCentreView';
import { AIIntelligenceDashboard } from './components/intelligence/AIIntelligenceDashboard';
import { NAVIGATION_ITEMS, NavSectionId, SurfaceTheme } from './types/navigation';
import { useFactorySimulation } from './hooks/useFactorySimulation';

export function App() {
  const [activeSection, setActiveSection] = React.useState<NavSectionId>('command-centre');
  const [manualThemeOverride, setManualThemeOverride] = React.useState<SurfaceTheme | null>(null);

  const {
    machines,
    overview,
    alerts,
    selectedMachine,
    selectedMachineId,
    setSelectedMachineId,
    isPaused,
    setIsPaused,
    acknowledgeAlert,
    setMachineOperatingProfile,
    machineModeOverrides,
    machineScenarios,
    injectFaultScenario,
    intelligenceByMachine,
    intelligenceList,
    maintenanceRecommendations,
    intelligenceSummary,
    updateMaintenanceStatus,
  } = useFactorySimulation();

  const selectedIntelligence =
    intelligenceByMachine[selectedMachineId] || intelligenceList[0];

  const currentNavItem =
    NAVIGATION_ITEMS.find((item) => item.id === activeSection) || NAVIGATION_ITEMS[0];

  // Hybrid design system: defaults to route's natural surface (Dark Command vs Light Enterprise)
  // while permitting instant manual inspection override in the header.
  const activeTheme: SurfaceTheme = manualThemeOverride ?? currentNavItem.defaultTheme;

  const handleSelectSection = (id: NavSectionId) => {
    setActiveSection(id);
    setManualThemeOverride(null);
  };

  const handleToggleTheme = () => {
    setManualThemeOverride((prev) => {
      const current = prev ?? currentNavItem.defaultTheme;
      return current === 'dark-command' ? 'light-enterprise' : 'dark-command';
    });
  };

  return (
    <AppShell
      activeSection={activeSection}
      onSelectSection={handleSelectSection}
      activeTheme={activeTheme}
      isThemeOverridden={manualThemeOverride !== null}
      onToggleTheme={handleToggleTheme}
      onResetThemeAuto={() => setManualThemeOverride(null)}
      overviewMetrics={overview}
    >
      {activeSection === 'command-centre' ? (
        <CommandCentreView
          machines={machines}
          overview={overview}
          alerts={alerts}
          selectedMachine={selectedMachine}
          selectedMachineId={selectedMachineId}
          onSelectMachine={setSelectedMachineId}
          isPaused={isPaused}
          onTogglePause={() => setIsPaused((prev) => !prev)}
          onAcknowledgeAlert={acknowledgeAlert}
          onSetMachineOperatingProfile={setMachineOperatingProfile}
          machineModeOverrides={machineModeOverrides}
          selectedIntelligence={selectedIntelligence}
          machineScenarios={machineScenarios}
          onInjectScenario={injectFaultScenario}
        />
      ) : activeSection === 'predictive-ai' ? (
        <AIIntelligenceDashboard
          machines={machines}
          selectedMachineId={selectedMachineId}
          onSelectMachine={setSelectedMachineId}
          intelligenceList={intelligenceList}
          selectedIntelligence={selectedIntelligence}
          intelligenceSummary={intelligenceSummary}
          maintenanceRecommendations={maintenanceRecommendations}
          machineScenarios={machineScenarios}
          onInjectScenario={injectFaultScenario}
          onUpdateMaintenanceStatus={updateMaintenanceStatus}
          isPaused={isPaused}
          onTogglePause={() => setIsPaused((prev) => !prev)}
        />
      ) : (
        <FoundationPreview
          activeSection={activeSection}
          activeTheme={activeTheme}
          onSelectSection={handleSelectSection}
          machines={machines}
          overview={overview}
          alerts={alerts}
          selectedMachine={selectedMachine}
          selectedMachineId={selectedMachineId}
          onSelectMachine={setSelectedMachineId}
          intelligenceList={intelligenceList}
          intelligenceSummary={intelligenceSummary}
          maintenanceRecommendations={maintenanceRecommendations}
          onUpdateMaintenanceStatus={updateMaintenanceStatus}
          onSetMachineOperatingProfile={setMachineOperatingProfile}
          machineModeOverrides={machineModeOverrides}
          machineScenarios={machineScenarios}
        />
      )}
    </AppShell>
  );
}

export default App;
