import { MachineId } from './telemetry';

export type RiskCategory = 'NORMAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AnomalyPatternType =
  | 'OVERHEATING'
  | 'EXCESSIVE_VIBRATION'
  | 'ABNORMAL_CURRENT'
  | 'MECHANICAL_OVERLOAD'
  | 'RPM_FLUCTUATION'
  | 'COMBINED_MULTI_SENSOR'
  | 'RAPID_THERMAL_RATE';

export type FaultScenarioId =
  | 'DEFAULT'
  | 'NORMAL_OPERATION'
  | 'GRADUAL_OVERHEATING'
  | 'SUDDEN_OVERHEATING'
  | 'EXCESSIVE_VIBRATION'
  | 'MECHANICAL_OVERLOAD'
  | 'COMBINED_SENSOR_FAILURE';

export interface FaultScenarioMetadata {
  id: FaultScenarioId;
  label: string;
  shortLabel: string;
  description: string;
  badgeTone: 'emerald' | 'amber' | 'crimson' | 'violet' | 'cyan';
}

export const FAULT_SCENARIOS: FaultScenarioMetadata[] = [
  {
    id: 'NORMAL_OPERATION',
    label: 'Normal Operation',
    shortLabel: 'Normal',
    description: 'Stabilizes thermal, vibration, electrical current, and torque load inside nominal envelope.',
    badgeTone: 'emerald',
  },
  {
    id: 'GRADUAL_OVERHEATING',
    label: 'Gradual Overheating',
    shortLabel: 'Gradual Heat',
    description: 'Simulates progressive coolant degradation with steady +0.9°C/tick thermal ramp.',
    badgeTone: 'amber',
  },
  {
    id: 'SUDDEN_OVERHEATING',
    label: 'Sudden Overheating',
    shortLabel: 'Thermal Spike',
    description: 'Simulates rapid cooling valve loss or friction seizure exceeding critical thermal threshold.',
    badgeTone: 'crimson',
  },
  {
    id: 'EXCESSIVE_VIBRATION',
    label: 'Excessive Vibration',
    shortLabel: 'Vibration Fault',
    description: 'Simulates ISO-10816 bearing raceway looseness & high RMS harmonic oscillation.',
    badgeTone: 'amber',
  },
  {
    id: 'MECHANICAL_OVERLOAD',
    label: 'Mechanical Overload',
    shortLabel: 'Mech Overload',
    description: 'Simulates mechanical jam / excessive torque demand (>95% load) with phase current surge & RPM sag.',
    badgeTone: 'crimson',
  },
  {
    id: 'COMBINED_SENSOR_FAILURE',
    label: 'Combined Sensor Failure',
    shortLabel: 'Multi-Sensor Fault',
    description: 'Simulates coupled electro-mechanical fault across thermal, vibration, current, and RPM stability.',
    badgeTone: 'violet',
  },
];

export interface ContributingSensorReading {
  sensor: 'TEMPERATURE' | 'VIBRATION' | 'CURRENT' | 'LOAD' | 'RPM' | 'POWER' | 'RATE_OF_CHANGE';
  label: string;
  measuredValue: string;
  expectedRange: string;
  deviationPercent: number;
  severity: 'NOMINAL' | 'ELEVATED' | 'CRITICAL';
}

export interface DetectedAnomaly {
  id: string;
  machineId: MachineId;
  machineName: string;
  type: AnomalyPatternType;
  title: string;
  severity: 'WARNING' | 'CRITICAL';
  anomalyScoreContribution: number;
  triggerSensor: string;
  measuredValue: string;
  expectedThreshold: string;
  rateOfChangeLabel: string;
  whatHappened: string;
  whyDangerous: string;
  operatorAction: string;
  detectedAt: string;
}

export interface MachineHealthIntelligence {
  machineId: MachineId;
  machineName: string;
  healthScore: number; // 0 - 100
  anomalyScore: number; // 0 - 100
  riskCategory: RiskCategory;
  primaryFaultIndicator: string;
  activeScenario: FaultScenarioId;
  ratesOfChange: {
    tempDeltaPerSec: number; // °C/s
    vibDeltaPerSec: number;  // mm/s²
    rpmJitterPercent: number; // %
  };
  contributingSensors: ContributingSensorReading[];
  activeAnomalies: DetectedAnomaly[];
  detectionExplanation: string;
}

export type MaintenancePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'IMMEDIATE';

export type MaintenanceWorkOrderStatus =
  | 'OPEN'
  | 'ACKNOWLEDGED'
  | 'IN_PROGRESS'
  | 'RESOLVED';

export interface PredictiveMaintenanceRecommendation {
  id: string;
  machineId: MachineId;
  machineName: string;
  bay: string;
  priority: MaintenancePriority;
  status: MaintenanceWorkOrderStatus;
  faultCategory: string;
  title: string;
  recommendedAction: string;
  suggestedInspectionWindow: string; // Clearly labeled as simulated recommendation
  estimatedOperationalImpact: string;
  triggeringSensors: string[];
  anomalyScore: number;
  healthScore: number;
  updatedAt: string;
  isConditionActive: boolean;
}

export interface IntelligenceOverviewSummary {
  machinesAtRiskCount: number;
  activeAnomaliesCount: number;
  criticalMachineCount: number;
  averageAnomalyScore: number;
  openMaintenanceCount: number;
  riskDistribution: Record<RiskCategory, number>;
}
