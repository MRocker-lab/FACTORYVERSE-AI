import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  MachineId,
  MachineStatus,
  MachineTelemetry,
  OperationalAlert,
  FactoryOverviewMetrics,
  TelemetryPoint,
} from '../types/telemetry';
import {
  FaultScenarioId,
  MachineHealthIntelligence,
  MaintenanceWorkOrderStatus,
  PredictiveMaintenanceRecommendation,
  IntelligenceOverviewSummary,
} from '../types/intelligence';
import {
  evaluateMachineIntelligence,
  deriveMaintenanceRecommendations,
  summarizeFactoryIntelligence,
} from '../utils/anomalyEngine';

const HISTORY_LENGTH = 24;

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

function round1(val: number): number {
  return Math.round(val * 10) / 10;
}

function formatTime(date: Date): string {
  return date.toTimeString().split(' ')[0];
}

interface MachineSeed {
  id: MachineId;
  name: string;
  category: string;
  controller: string;
  firmware: string;
  baseTemp: number;
  baseVib: number;
  baseRpm: number;
  baseCurrent: number;
  baseLoad: number;
  uptimeHours: number;
  cycleCount: number;
  thresholds: MachineTelemetry['thresholds'];
  position: MachineTelemetry['position'];
}

const MACHINE_SEEDS: MachineSeed[] = [
  {
    id: 'M-01',
    name: 'Conveyor Motor',
    category: 'Material Handling Drive',
    controller: 'Siemens S7-1500 PLC',
    firmware: 'v4.8.2-RT',
    baseTemp: 54.2,
    baseVib: 1.8,
    baseRpm: 1480,
    baseCurrent: 24.5,
    baseLoad: 72,
    uptimeHours: 1842,
    cycleCount: 142890,
    thresholds: {
      tempWarn: 68,
      tempCrit: 78,
      vibWarn: 3.5,
      vibCrit: 5.2,
      nominalRpm: 1500,
      maxRpm: 1800,
      nominalCurrent: 28,
      ratedPowerKw: 18.5,
    },
    position: { x: 130, y: 115, bay: 'BAY A-01', zone: 'INBOUND LOGISTICS' },
  },
  {
    id: 'M-02',
    name: 'Industrial Pump',
    category: 'High-Pressure Coolant Loop',
    controller: 'Allen-Bradley ControlLogix',
    firmware: 'v33.011',
    baseTemp: 61.5,
    baseVib: 2.3,
    baseRpm: 2890,
    baseCurrent: 38.2,
    baseLoad: 79,
    uptimeHours: 2410,
    cycleCount: 98400,
    thresholds: {
      tempWarn: 72,
      tempCrit: 84,
      vibWarn: 4.0,
      vibCrit: 6.0,
      nominalRpm: 2950,
      maxRpm: 3400,
      nominalCurrent: 42,
      ratedPowerKw: 30.0,
    },
    position: { x: 400, y: 115, bay: 'BAY A-02', zone: 'FLUID DYNAMICS' },
  },
  {
    id: 'M-03',
    name: 'CNC Machine',
    category: '5-Axis Precision Milling Center',
    controller: 'Fanuc 31i-Model B5',
    firmware: 'v6.14-CNC',
    baseTemp: 76.4, // Elevated warning range by default
    baseVib: 4.7,  // Elevated spindle vibration
    baseRpm: 8420,
    baseCurrent: 64.0,
    baseLoad: 89,
    uptimeHours: 964,
    cycleCount: 38120,
    thresholds: {
      tempWarn: 74,
      tempCrit: 86,
      vibWarn: 4.2,
      vibCrit: 6.4,
      nominalRpm: 8500,
      maxRpm: 12000,
      nominalCurrent: 68,
      ratedPowerKw: 52.0,
    },
    position: { x: 670, y: 115, bay: 'BAY A-03', zone: 'PRECISION MACHINING' },
  },
  {
    id: 'M-04',
    name: 'Robotic Arm',
    category: '6-DOF Articulated Assembly Manipulator',
    controller: 'KUKA KR C5 Micro',
    firmware: 'KSS 8.7.4',
    baseTemp: 49.8,
    baseVib: 1.4,
    baseRpm: 1120,
    baseCurrent: 19.8,
    baseLoad: 68,
    uptimeHours: 3120,
    cycleCount: 289400,
    thresholds: {
      tempWarn: 65,
      tempCrit: 75,
      vibWarn: 3.0,
      vibCrit: 4.8,
      nominalRpm: 1200,
      maxRpm: 1600,
      nominalCurrent: 24,
      ratedPowerKw: 14.5,
    },
    position: { x: 130, y: 275, bay: 'BAY B-01', zone: 'AUTOMATED ASSEMBLY' },
  },
  {
    id: 'M-05',
    name: 'Hydraulic Press',
    category: '800-Ton Heavy Stamping Forge',
    controller: 'Bosch Rexroth IndraMotion',
    firmware: 'MLC-14V22',
    baseTemp: 89.2, // Critical thermal state
    baseVib: 6.8,  // Critical harmonic shock
    baseRpm: 940,
    baseCurrent: 112.5,
    baseLoad: 95,
    uptimeHours: 615,
    cycleCount: 54910,
    thresholds: {
      tempWarn: 76,
      tempCrit: 87,
      vibWarn: 4.8,
      vibCrit: 6.5,
      nominalRpm: 1000,
      maxRpm: 1350,
      nominalCurrent: 105,
      ratedPowerKw: 85.0,
    },
    position: { x: 400, y: 275, bay: 'BAY B-02', zone: 'HEAVY STAMPING' },
  },
  {
    id: 'M-06',
    name: 'Cooling Unit',
    category: 'Closed-Loop Adiabatic Chiller',
    controller: 'Schneider Modicon M580',
    firmware: 'v3.20-HVAC',
    baseTemp: 42.6,
    baseVib: 1.5,
    baseRpm: 1760,
    baseCurrent: 31.4,
    baseLoad: 74,
    uptimeHours: 4290,
    cycleCount: 192300,
    thresholds: {
      tempWarn: 58,
      tempCrit: 68,
      vibWarn: 3.2,
      vibCrit: 5.0,
      nominalRpm: 1800,
      maxRpm: 2200,
      nominalCurrent: 36,
      ratedPowerKw: 24.0,
    },
    position: { x: 670, y: 275, bay: 'BAY B-03', zone: 'THERMAL MANAGEMENT' },
  },
];

function evaluateMachineHealthAndStatus(
  temp: number,
  vib: number,
  current: number,
  load: number,
  thresholds: MachineTelemetry['thresholds']
): { healthScore: number; status: MachineStatus; efficiency: number } {
  // Compute normalized stress ratios
  const tempRatio = temp / thresholds.tempCrit;
  const vibRatio = vib / thresholds.vibCrit;
  const currentRatio = current / (thresholds.nominalCurrent * 1.15);

  let penalty = 0;

  if (temp >= thresholds.tempCrit) {
    penalty += 34 + (temp - thresholds.tempCrit) * 2.2;
  } else if (temp >= thresholds.tempWarn) {
    penalty += 14 + ((temp - thresholds.tempWarn) / (thresholds.tempCrit - thresholds.tempWarn)) * 16;
  } else {
    penalty += Math.max(0, (tempRatio - 0.65) * 20);
  }

  if (vib >= thresholds.vibCrit) {
    penalty += 32 + (vib - thresholds.vibCrit) * 5.5;
  } else if (vib >= thresholds.vibWarn) {
    penalty += 14 + ((vib - thresholds.vibWarn) / (thresholds.vibCrit - thresholds.vibWarn)) * 16;
  } else {
    penalty += Math.max(0, (vibRatio - 0.5) * 18);
  }

  if (currentRatio > 1.0) {
    penalty += (currentRatio - 1.0) * 35;
  }

  const healthScore = Math.round(clamp(100 - penalty, 18, 99));

  let status: MachineStatus = 'RUNNING';
  if (
    temp >= thresholds.tempCrit ||
    vib >= thresholds.vibCrit ||
    load >= 93 ||
    healthScore < 55
  ) {
    status = 'CRITICAL';
  } else if (
    temp >= thresholds.tempWarn ||
    vib >= thresholds.vibWarn ||
    current > thresholds.nominalCurrent * 1.04 ||
    healthScore < 78
  ) {
    status = 'WARNING';
  }

  // Efficiency correlates with optimal load & machine health
  const loadFactor = load > 92 ? 96 - (load - 92) * 1.6 : 94 + (load - 65) * 0.12;
  const efficiency = round1(clamp(loadFactor * (0.72 + (healthScore / 100) * 0.28), 62, 98.8));

  return { healthScore, status, efficiency };
}

function buildInitialMachines(): MachineTelemetry[] {
  const now = Date.now();

  return MACHINE_SEEDS.map((seed, idx) => {
    const history: TelemetryPoint[] = [];

    for (let i = HISTORY_LENGTH - 1; i >= 0; i--) {
      const pointEpoch = now - i * 1500;
      const phase = (i + idx * 3) * 0.45;
      const temp = round1(seed.baseTemp + Math.sin(phase) * 0.9 + Math.cos(phase * 0.5) * 0.5);
      const vib = round1(clamp(seed.baseVib + Math.sin(phase * 1.1) * 0.18, 0.4, 12));
      const rpm = Math.round(seed.baseRpm + Math.sin(phase * 0.8) * (seed.baseRpm * 0.012));
      const load = round1(clamp(seed.baseLoad + Math.cos(phase * 0.7) * 2.2, 35, 99));
      const current = round1(seed.baseCurrent * (0.88 + (load / 100) * 0.16));
      const powerKw = round1(seed.thresholds.ratedPowerKw * (load / 100) * 0.92);
      const { healthScore } = evaluateMachineHealthAndStatus(
        temp,
        vib,
        current,
        load,
        seed.thresholds
      );

      history.push({
        timestamp: formatTime(new Date(pointEpoch)),
        epochMs: pointEpoch,
        temperature: temp,
        vibration: vib,
        rpm,
        current,
        load,
        powerKw,
        healthScore,
      });
    }

    const latest = history[history.length - 1];
    const { healthScore, status, efficiency } = evaluateMachineHealthAndStatus(
      latest.temperature,
      latest.vibration,
      latest.current,
      latest.load,
      seed.thresholds
    );

    return {
      id: seed.id,
      name: seed.name,
      category: seed.category,
      controller: seed.controller,
      firmware: seed.firmware,
      status,
      healthScore,
      temperature: latest.temperature,
      vibration: latest.vibration,
      rpm: latest.rpm,
      current: latest.current,
      load: latest.load,
      powerKw: latest.powerKw,
      efficiency,
      cycleCount: seed.cycleCount,
      uptimeHours: seed.uptimeHours,
      thresholds: seed.thresholds,
      position: seed.position,
      history,
    };
  });
}

function deriveOperationalAlerts(
  machines: MachineTelemetry[],
  acknowledgedIds: Set<string>
): OperationalAlert[] {
  const alerts: OperationalAlert[] = [];

  for (const m of machines) {
    const latestTime = m.history[m.history.length - 1]?.timestamp || formatTime(new Date());

    // 1. Temperature Check
    if (m.temperature >= m.thresholds.tempCrit) {
      const id = `${m.id}-TEMP-CRIT`;
      alerts.push({
        id,
        machineId: m.id,
        machineName: m.name,
        severity: 'CRITICAL',
        parameter: 'TEMPERATURE',
        title: 'Thermal Overload Threshold Exceeded',
        description: `${m.id} ${m.name} core temperature reached ${m.temperature}°C (critical limit ${m.thresholds.tempCrit}°C). Immediate load shedding or coolant boost required.`,
        measuredValue: `${m.temperature.toFixed(1)} °C`,
        thresholdValue: `${m.thresholds.tempCrit.toFixed(1)} °C`,
        timestamp: latestTime,
        acknowledged: acknowledgedIds.has(id),
      });
    } else if (m.temperature >= m.thresholds.tempWarn) {
      const id = `${m.id}-TEMP-WARN`;
      alerts.push({
        id,
        machineId: m.id,
        machineName: m.name,
        severity: 'WARNING',
        parameter: 'TEMPERATURE',
        title: 'Elevated Operating Temperature',
        description: `${m.id} ${m.name} thermal sensor reading ${m.temperature}°C exceeds advisory threshold (${m.thresholds.tempWarn}°C).`,
        measuredValue: `${m.temperature.toFixed(1)} °C`,
        thresholdValue: `${m.thresholds.tempWarn.toFixed(1)} °C`,
        timestamp: latestTime,
        acknowledged: acknowledgedIds.has(id),
      });
    }

    // 2. Vibration Check
    if (m.vibration >= m.thresholds.vibCrit) {
      const id = `${m.id}-VIB-CRIT`;
      alerts.push({
        id,
        machineId: m.id,
        machineName: m.name,
        severity: 'CRITICAL',
        parameter: 'VIBRATION',
        title: 'Severe Harmonic Vibration Anomaly',
        description: `${m.id} ${m.name} RMS vibration at ${m.vibration} mm/s exceeds ISO-10816 critical boundary (${m.thresholds.vibCrit} mm/s). Check bearing & frame mountings.`,
        measuredValue: `${m.vibration.toFixed(2)} mm/s`,
        thresholdValue: `${m.thresholds.vibCrit.toFixed(2)} mm/s`,
        timestamp: latestTime,
        acknowledged: acknowledgedIds.has(id),
      });
    } else if (m.vibration >= m.thresholds.vibWarn) {
      const id = `${m.id}-VIB-WARN`;
      alerts.push({
        id,
        machineId: m.id,
        machineName: m.name,
        severity: 'WARNING',
        parameter: 'VIBRATION',
        title: 'Spindle / Drive Vibration Drift',
        description: `${m.id} ${m.name} RMS vibration (${m.vibration} mm/s) is above nominal envelope (${m.thresholds.vibWarn} mm/s).`,
        measuredValue: `${m.vibration.toFixed(2)} mm/s`,
        thresholdValue: `${m.thresholds.vibWarn.toFixed(2)} mm/s`,
        timestamp: latestTime,
        acknowledged: acknowledgedIds.has(id),
      });
    }

    // 3. Current / Overload Check
    if (m.current > m.thresholds.nominalCurrent * 1.04) {
      const id = `${m.id}-CURR-WARN`;
      alerts.push({
        id,
        machineId: m.id,
        machineName: m.name,
        severity: m.status === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
        parameter: 'CURRENT',
        title: 'Phase Current Draw Surge',
        description: `${m.id} ${m.name} drawing ${m.current} A at ${m.load}% load (nominal rated ${m.thresholds.nominalCurrent} A).`,
        measuredValue: `${m.current.toFixed(1)} A`,
        thresholdValue: `${m.thresholds.nominalCurrent.toFixed(1)} A`,
        timestamp: latestTime,
        acknowledged: acknowledgedIds.has(id),
      });
    }

    // 4. Mechanical Load Check
    if (m.load >= 93) {
      const id = `${m.id}-LOAD-CRIT`;
      alerts.push({
        id,
        machineId: m.id,
        machineName: m.name,
        severity: 'CRITICAL',
        parameter: 'LOAD',
        title: 'Mechanical Torque Overload Breach',
        description: `${m.id} ${m.name} mechanical torque load reached ${m.load}% (continuous ceiling 93%).`,
        measuredValue: `${m.load.toFixed(1)} %`,
        thresholdValue: `93.0 %`,
        timestamp: latestTime,
        acknowledged: acknowledgedIds.has(id),
      });
    }
  }

  // Sort CRITICAL first, then WARNING, then unacknowledged first
  return alerts.sort((a, b) => {
    if (a.severity !== b.severity) {
      return a.severity === 'CRITICAL' ? -1 : 1;
    }
    if (a.acknowledged !== b.acknowledged) {
      return a.acknowledged ? 1 : -1;
    }
    return a.machineId.localeCompare(b.machineId);
  });
}

export function useFactorySimulation() {
  const [machines, setMachines] = useState<MachineTelemetry[]>(() => buildInitialMachines());
  const [selectedMachineId, setSelectedMachineId] = useState<MachineId>('M-03');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [acknowledgedAlertIds, setAcknowledgedAlertIds] = useState<Set<string>>(() => new Set());

  // Fault scenario overrides allow operators to inject realistic fault modes or stabilize a machine
  // while keeping the simulation engine 100% consistent across cards, charts, SVG floor, alerts, and AI intelligence.
  const [machineScenarios, setMachineScenarios] = useState<
    Partial<Record<MachineId, FaultScenarioId>>
  >({});

  // Operator-managed maintenance work order statuses (OPEN, ACKNOWLEDGED, IN_PROGRESS, RESOLVED)
  const [workOrderStatuses, setWorkOrderStatuses] = useState<
    Record<string, MaintenanceWorkOrderStatus>
  >({});

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const now = new Date();
      const epochMs = now.getTime();
      const timestamp = formatTime(now);

      setMachines((prevMachines) =>
        prevMachines.map((machine, idx) => {
          const seed = MACHINE_SEEDS[idx];
          const scenario = machineScenarios[machine.id] || 'DEFAULT';

          // Determine target attractor values and step dynamics based on active fault scenario
          let targetTemp = seed.baseTemp;
          let targetVib = seed.baseVib;
          let targetLoad = seed.baseLoad;
          let tempStepRate = 0.24;
          let vibStepRate = 0.25;
          let extraRpmJitterFactor = 1.0;
          let currentMultiplier = 1.0;

          switch (scenario) {
            case 'NORMAL_OPERATION':
              targetTemp = seed.thresholds.tempWarn - 11;
              targetVib = round1(seed.thresholds.vibWarn * 0.52);
              targetLoad = 72;
              tempStepRate = 0.32;
              vibStepRate = 0.32;
              break;
            case 'GRADUAL_OVERHEATING':
              // Progressive thermal ramp (+0.9 to +1.3°C per tick) simulating gradual coolant loss
              targetTemp = Math.min(
                seed.thresholds.tempCrit + 5.5,
                machine.temperature + 1.15
              );
              targetVib = round1(seed.thresholds.vibWarn * 0.92);
              targetLoad = 86;
              tempStepRate = 0.65;
              break;
            case 'SUDDEN_OVERHEATING':
              targetTemp = seed.thresholds.tempCrit + 6.5;
              targetVib = round1(seed.thresholds.vibWarn * 1.05);
              targetLoad = 91;
              tempStepRate = 0.55;
              break;
            case 'EXCESSIVE_VIBRATION':
              targetTemp = seed.thresholds.tempWarn - 2;
              targetVib = seed.thresholds.vibCrit + 1.1;
              targetLoad = 85;
              vibStepRate = 0.48;
              extraRpmJitterFactor = 4.2;
              break;
            case 'MECHANICAL_OVERLOAD':
              targetTemp = seed.thresholds.tempWarn + 2.5;
              targetVib = round1(seed.thresholds.vibWarn * 1.08);
              targetLoad = 97.5;
              currentMultiplier = 1.16;
              extraRpmJitterFactor = 5.5;
              break;
            case 'COMBINED_SENSOR_FAILURE':
              targetTemp = seed.thresholds.tempCrit + 4.8;
              targetVib = seed.thresholds.vibCrit + 1.25;
              targetLoad = 96.8;
              tempStepRate = 0.45;
              vibStepRate = 0.45;
              currentMultiplier = 1.18;
              extraRpmJitterFactor = 6.5;
              break;
            default:
              break;
          }

          // Smooth mean-reverting stochastic step (Ornstein-Uhlenbeck style)
          const wave = Math.sin(epochMs / 2200 + idx * 1.7);
          const microNoise = (Math.random() - 0.5) * 0.75;

          const nextTemp = round1(
            clamp(
              machine.temperature +
                (targetTemp - machine.temperature) * tempStepRate +
                wave * 0.35 +
                microNoise * 0.4,
              32,
              105
            )
          );

          const nextVib = round1(
            clamp(
              machine.vibration +
                (targetVib - machine.vibration) * vibStepRate +
                Math.cos(epochMs / 1800 + idx) * 0.08 +
                (Math.random() - 0.5) * 0.12,
              0.5,
              9.8
            )
          );

          const nextLoad = round1(
            clamp(
              machine.load +
                (targetLoad - machine.load) * 0.32 +
                (Math.random() - 0.5) * 1.2,
              40,
              99
            )
          );

          const rpmJitter =
            (Math.random() - 0.5) * (seed.baseRpm * 0.008 * extraRpmJitterFactor);
          const loadRpmOffset =
            scenario === 'MECHANICAL_OVERLOAD' || scenario === 'COMBINED_SENSOR_FAILURE'
              ? -(seed.baseRpm * 0.065) // RPM sag under heavy mechanical binding
              : ((nextLoad - seed.baseLoad) / 100) * (seed.baseRpm * 0.03);

          const nextRpm = Math.round(
            clamp(
              seed.baseRpm + loadRpmOffset + rpmJitter,
              seed.baseRpm * 0.72,
              seed.thresholds.maxRpm
            )
          );

          const nextCurrent = round1(
            clamp(
              seed.baseCurrent *
                currentMultiplier *
                (0.85 + (nextLoad / 100) * 0.22) +
                (Math.random() - 0.5) * 0.45,
              8,
              seed.thresholds.nominalCurrent * 1.38
            )
          );

          const nextPowerKw = round1(
            clamp(
              seed.thresholds.ratedPowerKw *
                (nextLoad / 100) *
                (0.88 + (nextTemp > seed.thresholds.tempWarn ? 0.07 : 0.02)),
              4,
              seed.thresholds.ratedPowerKw * 1.15
            )
          );

          const { healthScore, status, efficiency } = evaluateMachineHealthAndStatus(
            nextTemp,
            nextVib,
            nextCurrent,
            nextLoad,
            machine.thresholds
          );

          const nextPoint: TelemetryPoint = {
            timestamp,
            epochMs,
            temperature: nextTemp,
            vibration: nextVib,
            rpm: nextRpm,
            current: nextCurrent,
            load: nextLoad,
            powerKw: nextPowerKw,
            healthScore,
          };

          const updatedHistory = [...machine.history.slice(1), nextPoint];

          return {
            ...machine,
            status,
            healthScore,
            temperature: nextTemp,
            vibration: nextVib,
            rpm: nextRpm,
            current: nextCurrent,
            load: nextLoad,
            powerKw: nextPowerKw,
            efficiency,
            cycleCount: machine.cycleCount + 1,
            history: updatedHistory,
          };
        })
      );
    }, 1500);

    return () => clearInterval(interval);
  }, [isPaused, machineScenarios]);

  const alerts = useMemo(
    () => deriveOperationalAlerts(machines, acknowledgedAlertIds),
    [machines, acknowledgedAlertIds]
  );

  const overview = useMemo<FactoryOverviewMetrics>(() => {
    const totalMachines = machines.length;
    const runningCount = machines.filter((m) => m.status === 'RUNNING').length;
    const warningCount = machines.filter((m) => m.status === 'WARNING').length;
    const criticalCount = machines.filter((m) => m.status === 'CRITICAL').length;

    const totalPowerKw = round1(machines.reduce((acc, m) => acc + m.powerKw, 0));
    const overallEfficiency = round1(
      machines.reduce((acc, m) => acc + m.efficiency, 0) / totalMachines
    );
    const averageHealth = Math.round(
      machines.reduce((acc, m) => acc + m.healthScore, 0) / totalMachines
    );
    const lastTickTimestamp =
      machines[0]?.history[machines[0].history.length - 1]?.timestamp || '--:--:--';

    return {
      totalMachines,
      runningCount,
      warningCount,
      criticalCount,
      overallEfficiency,
      totalPowerKw,
      averageHealth,
      activeAlertsCount: alerts.length,
      lastTickTimestamp,
    };
  }, [machines, alerts]);

  const selectedMachine = useMemo(
    () => machines.find((m) => m.id === selectedMachineId) || machines[0],
    [machines, selectedMachineId]
  );

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAcknowledgedAlertIds((prev) => {
      const next = new Set(prev);
      if (next.has(alertId)) {
        next.delete(alertId);
      } else {
        next.add(alertId);
      }
      return next;
    });
  }, []);

  const injectFaultScenario = useCallback(
    (machineId: MachineId, scenario: FaultScenarioId) => {
      setMachineScenarios((prev) => {
        const next = { ...prev };
        if (scenario === 'DEFAULT') {
          delete next[machineId];
        } else {
          next[machineId] = scenario;
        }
        return next;
      });

      // Immediately apply an initial directional nudge so the user sees instant response on click
      // while subsequent simulation ticks continue evolving the trajectory smoothly.
      setMachines((prevMachines) =>
        prevMachines.map((m, idx) => {
          if (m.id !== machineId) return m;
          const seed = MACHINE_SEEDS[idx];
          const now = new Date();
          const timestamp = formatTime(now);
          const epochMs = now.getTime();

          let nextTemp = m.temperature;
          let nextVib = m.vibration;
          let nextLoad = m.load;
          let nextCurrent = m.current;
          let nextRpm = m.rpm;

          if (scenario === 'NORMAL_OPERATION') {
            nextTemp = round1(seed.thresholds.tempWarn - 10);
            nextVib = round1(seed.thresholds.vibWarn * 0.55);
            nextLoad = 72;
            nextCurrent = round1(seed.baseCurrent * 0.92);
            nextRpm = seed.baseRpm;
          } else if (scenario === 'GRADUAL_OVERHEATING') {
            nextTemp = round1(Math.max(m.temperature + 1.8, seed.thresholds.tempWarn + 0.8));
            nextLoad = 86;
          } else if (scenario === 'SUDDEN_OVERHEATING') {
            nextTemp = round1(seed.thresholds.tempCrit + 4.2);
            nextLoad = 91;
          } else if (scenario === 'EXCESSIVE_VIBRATION') {
            nextVib = round1(seed.thresholds.vibCrit + 0.85);
            nextRpm = Math.round(seed.baseRpm * 0.93);
          } else if (scenario === 'MECHANICAL_OVERLOAD') {
            nextLoad = 96.5;
            nextCurrent = round1(seed.thresholds.nominalCurrent * 1.18);
            nextRpm = Math.round(seed.baseRpm * 0.91);
          } else if (scenario === 'COMBINED_SENSOR_FAILURE') {
            nextTemp = round1(seed.thresholds.tempCrit + 3.8);
            nextVib = round1(seed.thresholds.vibCrit + 1.1);
            nextLoad = 96.2;
            nextCurrent = round1(seed.thresholds.nominalCurrent * 1.2);
            nextRpm = Math.round(seed.baseRpm * 0.89);
          } else if (scenario === 'DEFAULT') {
            nextTemp = seed.baseTemp;
            nextVib = seed.baseVib;
            nextLoad = seed.baseLoad;
            nextCurrent = seed.baseCurrent;
            nextRpm = seed.baseRpm;
          }

          const nextPowerKw = round1(
            clamp(seed.thresholds.ratedPowerKw * (nextLoad / 100) * 0.92, 4, seed.thresholds.ratedPowerKw * 1.15)
          );

          const { healthScore, status, efficiency } = evaluateMachineHealthAndStatus(
            nextTemp,
            nextVib,
            nextCurrent,
            nextLoad,
            m.thresholds
          );

          const nextPoint: TelemetryPoint = {
            timestamp,
            epochMs,
            temperature: nextTemp,
            vibration: nextVib,
            rpm: nextRpm,
            current: nextCurrent,
            load: nextLoad,
            powerKw: nextPowerKw,
            healthScore,
          };

          return {
            ...m,
            status,
            healthScore,
            temperature: nextTemp,
            vibration: nextVib,
            rpm: nextRpm,
            current: nextCurrent,
            load: nextLoad,
            powerKw: nextPowerKw,
            efficiency,
            history: [...m.history.slice(1), nextPoint],
          };
        })
      );
    },
    []
  );

  // Backwards-compatible wrapper for Phase 2 quick override buttons
  const setMachineOperatingProfile = useCallback(
    (machineId: MachineId, profile: 'NOMINAL' | 'WARNING' | 'CRITICAL' | 'DEFAULT') => {
      if (profile === 'NOMINAL') {
        injectFaultScenario(machineId, 'NORMAL_OPERATION');
      } else if (profile === 'WARNING') {
        injectFaultScenario(machineId, 'GRADUAL_OVERHEATING');
      } else if (profile === 'CRITICAL') {
        injectFaultScenario(machineId, 'COMBINED_SENSOR_FAILURE');
      } else {
        injectFaultScenario(machineId, 'DEFAULT');
      }
    },
    [injectFaultScenario]
  );

  // Compute Machine Health Intelligence for all 6 machines
  const intelligenceByMachine = useMemo<Record<MachineId, MachineHealthIntelligence>>(() => {
    const map = {} as Record<MachineId, MachineHealthIntelligence>;
    for (const m of machines) {
      map[m.id] = evaluateMachineIntelligence(m, machineScenarios[m.id] || 'DEFAULT');
    }
    return map;
  }, [machines, machineScenarios]);

  const intelligenceList = useMemo<MachineHealthIntelligence[]>(
    () => machines.map((m) => intelligenceByMachine[m.id]),
    [machines, intelligenceByMachine]
  );

  const maintenanceRecommendations = useMemo<PredictiveMaintenanceRecommendation[]>(
    () =>
      deriveMaintenanceRecommendations(
        machines,
        intelligenceByMachine,
        workOrderStatuses
      ),
    [machines, intelligenceByMachine, workOrderStatuses]
  );

  const intelligenceSummary = useMemo<IntelligenceOverviewSummary>(
    () => summarizeFactoryIntelligence(intelligenceList, maintenanceRecommendations),
    [intelligenceList, maintenanceRecommendations]
  );

  const updateMaintenanceStatus = useCallback(
    (recommendationId: string, status: MaintenanceWorkOrderStatus, _machineId?: MachineId) => {
      // Keep maintenance status strictly separate from simulated machine recovery.
      // Resolving a work order updates the administrative dispatch status without falsely claiming physical machine repair.
      setWorkOrderStatuses((prev) => ({
        ...prev,
        [recommendationId]: status,
      }));
    },
    []
  );

  const machineModeOverrides = useMemo(() => {
    const legacy: Partial<Record<MachineId, 'NOMINAL' | 'WARNING' | 'CRITICAL'>> = {};
    for (const m of machines) {
      const sc = machineScenarios[m.id];
      if (sc === 'NORMAL_OPERATION') legacy[m.id] = 'NOMINAL';
      else if (sc === 'GRADUAL_OVERHEATING' || sc === 'EXCESSIVE_VIBRATION')
        legacy[m.id] = 'WARNING';
      else if (
        sc === 'SUDDEN_OVERHEATING' ||
        sc === 'MECHANICAL_OVERLOAD' ||
        sc === 'COMBINED_SENSOR_FAILURE'
      )
        legacy[m.id] = 'CRITICAL';
    }
    return legacy;
  }, [machines, machineScenarios]);

  return {
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
    // Phase 3 AI Intelligence & Predictive Maintenance exports
    machineScenarios,
    injectFaultScenario,
    intelligenceByMachine,
    intelligenceList,
    maintenanceRecommendations,
    intelligenceSummary,
    updateMaintenanceStatus,
  };
}
