export type MachineId = 'M-01' | 'M-02' | 'M-03' | 'M-04' | 'M-05' | 'M-06';

export type MachineStatus = 'RUNNING' | 'WARNING' | 'CRITICAL';

export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface TelemetryPoint {
  timestamp: string;
  epochMs: number;
  temperature: number; // °C
  vibration: number;   // mm/s RMS
  rpm: number;
  current: number;     // Amps (A)
  load: number;        // %
  powerKw: number;     // kW
  healthScore: number; // 0 - 100%
}

export interface MachineThresholds {
  tempWarn: number;
  tempCrit: number;
  vibWarn: number;
  vibCrit: number;
  nominalRpm: number;
  maxRpm: number;
  nominalCurrent: number;
  ratedPowerKw: number;
}

export interface MachineFloorPosition {
  x: number; // SVG coordinate X (0-800)
  y: number; // SVG coordinate Y (0-380)
  bay: string;
  zone: string;
}

export interface MachineTelemetry {
  id: MachineId;
  name: string;
  category: string;
  controller: string;
  firmware: string;
  status: MachineStatus;
  healthScore: number;
  temperature: number; // °C
  vibration: number;   // mm/s
  rpm: number;
  current: number;     // A
  load: number;        // %
  powerKw: number;     // kW
  efficiency: number;  // %
  cycleCount: number;
  uptimeHours: number;
  thresholds: MachineThresholds;
  position: MachineFloorPosition;
  history: TelemetryPoint[];
}

export interface OperationalAlert {
  id: string;
  machineId: MachineId;
  machineName: string;
  severity: AlertSeverity;
  parameter: 'TEMPERATURE' | 'VIBRATION' | 'CURRENT' | 'HEALTH' | 'LOAD';
  title: string;
  description: string;
  measuredValue: string;
  thresholdValue: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface FactoryOverviewMetrics {
  totalMachines: number;
  runningCount: number;
  warningCount: number;
  criticalCount: number;
  overallEfficiency: number;   // %
  totalPowerKw: number;        // kW
  averageHealth: number;       // %
  activeAlertsCount: number;
  lastTickTimestamp: string;
}
