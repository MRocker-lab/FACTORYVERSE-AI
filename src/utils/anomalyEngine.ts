import { MachineTelemetry } from '../types/telemetry';
import {
  ContributingSensorReading,
  DetectedAnomaly,
  FaultScenarioId,
  IntelligenceOverviewSummary,
  MachineHealthIntelligence,
  MaintenancePriority,
  MaintenanceWorkOrderStatus,
  PredictiveMaintenanceRecommendation,
  RiskCategory,
} from '../types/intelligence';

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

function round1(val: number): number {
  return Math.round(val * 10) / 10;
}

function round2(val: number): number {
  return Math.round(val * 100) / 100;
}

/**
 * Transparent, explainable rule-based + trend-slope anomaly detection engine.
 * Analyzes live telemetry + rolling history window to compute rate of change,
 * multi-sensor correlations, anomaly score (0-100), risk category, and structured explanations.
 */
export function evaluateMachineIntelligence(
  machine: MachineTelemetry,
  activeScenario: FaultScenarioId = 'DEFAULT'
): MachineHealthIntelligence {
  const { thresholds, history } = machine;
  const latestTime = history[history.length - 1]?.timestamp || '--:--:--';

  // 1. Trend & Rate-of-Change Analysis over recent window (last 5 points ~ 6 seconds)
  const lookbackCount = Math.min(5, history.length);
  const recentSlice = history.slice(history.length - lookbackCount);
  const firstPt = recentSlice[0];
  const lastPt = recentSlice[recentSlice.length - 1];
  const elapsedSec = Math.max(1.5, ((lastPt?.epochMs ?? 0) - (firstPt?.epochMs ?? 0)) / 1000);

  const tempDeltaPerSec = round2(((lastPt?.temperature ?? machine.temperature) - (firstPt?.temperature ?? machine.temperature)) / elapsedSec);
  const vibDeltaPerSec = round2(((lastPt?.vibration ?? machine.vibration) - (firstPt?.vibration ?? machine.vibration)) / elapsedSec);

  // RPM fluctuation / jitter calculation across recent window
  const recentRpms = recentSlice.map((p) => p.rpm);
  const minRpm = Math.min(...recentRpms);
  const maxRpm = Math.max(...recentRpms);
  const rpmSpread = maxRpm - minRpm;
  const rpmDeviationFromNominal = Math.abs(machine.rpm - thresholds.nominalRpm);
  const rpmJitterPercent = round1(
    (Math.max(rpmSpread, rpmDeviationFromNominal) / Math.max(1, thresholds.nominalRpm)) * 100
  );

  // 2. Evaluate Contributing Sensor Readings
  const contributingSensors: ContributingSensorReading[] = [];

  // Temperature sensor assessment
  const tempDeviationPct = round1(
    ((machine.temperature - thresholds.tempWarn) / thresholds.tempWarn) * 100
  );
  const tempSeverity: ContributingSensorReading['severity'] =
    machine.temperature >= thresholds.tempCrit
      ? 'CRITICAL'
      : machine.temperature >= thresholds.tempWarn
      ? 'ELEVATED'
      : 'NOMINAL';

  contributingSensors.push({
    sensor: 'TEMPERATURE',
    label: 'Core RTD Temperature',
    measuredValue: `${machine.temperature.toFixed(1)} °C`,
    expectedRange: `< ${thresholds.tempWarn.toFixed(0)} °C (Crit ${thresholds.tempCrit.toFixed(0)} °C)`,
    deviationPercent: tempDeviationPct,
    severity: tempSeverity,
  });

  // Vibration sensor assessment
  const vibDeviationPct = round1(
    ((machine.vibration - thresholds.vibWarn) / thresholds.vibWarn) * 100
  );
  const vibSeverity: ContributingSensorReading['severity'] =
    machine.vibration >= thresholds.vibCrit
      ? 'CRITICAL'
      : machine.vibration >= thresholds.vibWarn
      ? 'ELEVATED'
      : 'NOMINAL';

  contributingSensors.push({
    sensor: 'VIBRATION',
    label: 'Tri-Axial RMS Vibration',
    measuredValue: `${machine.vibration.toFixed(2)} mm/s`,
    expectedRange: `< ${thresholds.vibWarn.toFixed(1)} mm/s (Crit ${thresholds.vibCrit.toFixed(1)} mm/s)`,
    deviationPercent: vibDeviationPct,
    severity: vibSeverity,
  });

  // Phase Current sensor assessment
  const currentWarn = round1(thresholds.nominalCurrent * 1.04);
  const currentCrit = round1(thresholds.nominalCurrent * 1.15);
  const currentDeviationPct = round1(
    ((machine.current - thresholds.nominalCurrent) / thresholds.nominalCurrent) * 100
  );
  const currentSeverity: ContributingSensorReading['severity'] =
    machine.current >= currentCrit
      ? 'CRITICAL'
      : machine.current >= currentWarn
      ? 'ELEVATED'
      : 'NOMINAL';

  contributingSensors.push({
    sensor: 'CURRENT',
    label: '3-Phase Stator Current',
    measuredValue: `${machine.current.toFixed(1)} A`,
    expectedRange: `≤ ${thresholds.nominalCurrent.toFixed(1)} A (Crit ${currentCrit} A)`,
    deviationPercent: currentDeviationPct,
    severity: currentSeverity,
  });

  // Mechanical Load assessment
  const loadWarn = 88;
  const loadCrit = 94;
  const loadSeverity: ContributingSensorReading['severity'] =
    machine.load >= loadCrit
      ? 'CRITICAL'
      : machine.load >= loadWarn
      ? 'ELEVATED'
      : 'NOMINAL';

  contributingSensors.push({
    sensor: 'LOAD',
    label: 'Mechanical Torque Load',
    measuredValue: `${machine.load.toFixed(1)} %`,
    expectedRange: `60% – 88% (Crit ${loadCrit}%)`,
    deviationPercent: round1(machine.load - 75),
    severity: loadSeverity,
  });

  // Rotational RPM Stability assessment
  const rpmSeverity: ContributingSensorReading['severity'] =
    rpmJitterPercent >= 8.5
      ? 'CRITICAL'
      : rpmJitterPercent >= 4.5
      ? 'ELEVATED'
      : 'NOMINAL';

  contributingSensors.push({
    sensor: 'RPM',
    label: 'Spindle / Shaft Speed',
    measuredValue: `${machine.rpm.toLocaleString()} RPM (${rpmJitterPercent}% drift)`,
    expectedRange: `${thresholds.nominalRpm.toLocaleString()} RPM ±3.5%`,
    deviationPercent: rpmJitterPercent,
    severity: rpmSeverity,
  });

  // Power Draw assessment
  const powerWarn = round1(thresholds.ratedPowerKw * 0.9);
  const powerCrit = round1(thresholds.ratedPowerKw * 0.98);
  const powerSeverity: ContributingSensorReading['severity'] =
    machine.powerKw >= powerCrit
      ? 'CRITICAL'
      : machine.powerKw >= powerWarn
      ? 'ELEVATED'
      : 'NOMINAL';

  contributingSensors.push({
    sensor: 'POWER',
    label: 'Real-Time Power Draw',
    measuredValue: `${machine.powerKw.toFixed(1)} kW`,
    expectedRange: `≤ ${powerWarn} kW (Rated ${thresholds.ratedPowerKw} kW)`,
    deviationPercent: round1(((machine.powerKw - powerWarn) / powerWarn) * 100),
    severity: powerSeverity,
  });

  // 3. Rule-Based & Trend-Based Anomaly Detections
  const activeAnomalies: DetectedAnomaly[] = [];
  const rateLabel = `${tempDeltaPerSec >= 0 ? '+' : ''}${tempDeltaPerSec.toFixed(2)} °C/s | ${
    vibDeltaPerSec >= 0 ? '+' : ''
  }${vibDeltaPerSec.toFixed(2)} mm/s²`;

  // Rule A: Overheating (Static threshold OR Rapid positive thermal slope)
  if (machine.temperature >= thresholds.tempCrit) {
    activeAnomalies.push({
      id: `${machine.id}-ANOM-OVERHEAT-CRIT`,
      machineId: machine.id,
      machineName: machine.name,
      type: 'OVERHEATING',
      title: 'Critical Thermal Runaway / Overheating',
      severity: 'CRITICAL',
      anomalyScoreContribution: 42,
      triggerSensor: 'Core RTD Temperature Sensor',
      measuredValue: `${machine.temperature.toFixed(1)} °C (${tempDeltaPerSec >= 0 ? '+' : ''}${tempDeltaPerSec} °C/s)`,
      expectedThreshold: `< ${thresholds.tempCrit.toFixed(1)} °C (Critical Ceiling)`,
      rateOfChangeLabel: rateLabel,
      whatHappened: `${machine.id} (${machine.name}) core temperature breached its critical thermal ceiling of ${thresholds.tempCrit}°C, currently reading ${machine.temperature.toFixed(1)}°C.`,
      whyDangerous: `Sustained operation above ${thresholds.tempCrit}°C accelerates stator winding insulation breakdown, degrades lubricant viscosity, and risks thermal seizure.`,
      operatorAction: `Immediately reduce duty cycle load below 70%, verify coolant flow pressure, and schedule thermal inspection before resuming peak load.`,
      detectedAt: latestTime,
    });
  } else if (machine.temperature >= thresholds.tempWarn || tempDeltaPerSec >= 0.45) {
    const isRapidSlope = tempDeltaPerSec >= 0.45 && machine.temperature < thresholds.tempWarn;
    activeAnomalies.push({
      id: `${machine.id}-ANOM-OVERHEAT-WARN`,
      machineId: machine.id,
      machineName: machine.name,
      type: isRapidSlope ? 'RAPID_THERMAL_RATE' : 'OVERHEATING',
      title: isRapidSlope
        ? 'Rapid Positive Thermal Rate-of-Change Detected'
        : 'Elevated Thermal Operating Envelope',
      severity: 'WARNING',
      anomalyScoreContribution: 24,
      triggerSensor: 'Core RTD Temperature Sensor + Trend Derivative',
      measuredValue: `${machine.temperature.toFixed(1)} °C (Slope: +${tempDeltaPerSec.toFixed(2)} °C/s)`,
      expectedThreshold: `< ${thresholds.tempWarn.toFixed(1)} °C (Slope < +0.35 °C/s)`,
      rateOfChangeLabel: rateLabel,
      whatHappened: isRapidSlope
        ? `${machine.id} temperature is rising at +${tempDeltaPerSec.toFixed(2)} °C/s toward warning limit (${thresholds.tempWarn}°C).`
        : `${machine.id} core temperature (${machine.temperature.toFixed(1)}°C) exceeded the advisory threshold of ${thresholds.tempWarn}°C.`,
      whyDangerous: `Progressive thermal accumulation indicates restricted heat-exchanger efficiency or rising frictional losses before hard trip limits occur.`,
      operatorAction: `Inspect heat-exchanger valves and secondary coolant loop flow; monitor temperature slope over the next 15 minutes.`,
      detectedAt: latestTime,
    });
  }

  // Rule B: Excessive Vibration
  if (machine.vibration >= thresholds.vibCrit) {
    activeAnomalies.push({
      id: `${machine.id}-ANOM-VIB-CRIT`,
      machineId: machine.id,
      machineName: machine.name,
      type: 'EXCESSIVE_VIBRATION',
      title: 'Critical ISO-10816 Harmonic Vibration Breach',
      severity: 'CRITICAL',
      anomalyScoreContribution: 40,
      triggerSensor: 'Tri-Axial Piezo Accelerometer (RMS)',
      measuredValue: `${machine.vibration.toFixed(2)} mm/s`,
      expectedThreshold: `< ${thresholds.vibCrit.toFixed(2)} mm/s (ISO Class III Critical)`,
      rateOfChangeLabel: rateLabel,
      whatHappened: `${machine.id} RMS vibration velocity reached ${machine.vibration.toFixed(2)} mm/s, exceeding the critical mechanical boundary (${thresholds.vibCrit} mm/s).`,
      whyDangerous: `High-amplitude harmonic vibration causes rapid bearing raceway spalling, shaft misalignment, and structural fatigue across anchor bolts.`,
      operatorAction: `Initiate controlled speed reduction, inspect drive shaft alignment and bearing preload, and execute dynamic balancing check.`,
      detectedAt: latestTime,
    });
  } else if (machine.vibration >= thresholds.vibWarn) {
    activeAnomalies.push({
      id: `${machine.id}-ANOM-VIB-WARN`,
      machineId: machine.id,
      machineName: machine.name,
      type: 'EXCESSIVE_VIBRATION',
      title: 'Elevated Spindle / Frame Vibration Drift',
      severity: 'WARNING',
      anomalyScoreContribution: 22,
      triggerSensor: 'Tri-Axial Piezo Accelerometer (RMS)',
      measuredValue: `${machine.vibration.toFixed(2)} mm/s`,
      expectedThreshold: `< ${thresholds.vibWarn.toFixed(2)} mm/s (Nominal Envelope)`,
      rateOfChangeLabel: rateLabel,
      whatHappened: `${machine.id} vibration level (${machine.vibration.toFixed(2)} mm/s) drifted above its nominal operating threshold (${thresholds.vibWarn} mm/s).`,
      whyDangerous: `Early-stage kinetic oscillation typically precedes bearing wear, tool-holder imbalance, or loose mounting dampers.`,
      operatorAction: `Schedule acoustic bearing check and verify mounting fastener torque during upcoming shift window.`,
      detectedAt: latestTime,
    });
  }

  // Rule C: Abnormal Current Consumption
  if (machine.current >= currentCrit) {
    activeAnomalies.push({
      id: `${machine.id}-ANOM-CURRENT-CRIT`,
      machineId: machine.id,
      machineName: machine.name,
      type: 'ABNORMAL_CURRENT',
      title: 'Critical Phase Current Overdraw',
      severity: 'CRITICAL',
      anomalyScoreContribution: 26,
      triggerSensor: 'Hall-Effect 3-Phase Current Transducer',
      measuredValue: `${machine.current.toFixed(1)} A (${machine.powerKw.toFixed(1)} kW)`,
      expectedThreshold: `≤ ${thresholds.nominalCurrent.toFixed(1)} A Nominal (Crit ${currentCrit} A)`,
      rateOfChangeLabel: rateLabel,
      whatHappened: `Phase current surged to ${machine.current.toFixed(1)} A (+${currentDeviationPct}% above rated nominal ${thresholds.nominalCurrent} A).`,
      whyDangerous: `Excessive current draw generates $I^2R$ copper heating in motor windings and risks VFD inverter IGBT overcurrent trip.`,
      operatorAction: `Check mechanical drive train for binding, inspect VFD current-limit parameters, and verify phase balance.`,
      detectedAt: latestTime,
    });
  } else if (machine.current >= currentWarn) {
    activeAnomalies.push({
      id: `${machine.id}-ANOM-CURRENT-WARN`,
      machineId: machine.id,
      machineName: machine.name,
      type: 'ABNORMAL_CURRENT',
      title: 'Elevated Stator Current Consumption',
      severity: 'WARNING',
      anomalyScoreContribution: 14,
      triggerSensor: 'Hall-Effect 3-Phase Current Transducer',
      measuredValue: `${machine.current.toFixed(1)} A`,
      expectedThreshold: `≤ ${thresholds.nominalCurrent.toFixed(1)} A Nominal`,
      rateOfChangeLabel: rateLabel,
      whatHappened: `${machine.id} is drawing ${machine.current.toFixed(1)} A, exceeding the ${currentWarn} A advisory threshold.`,
      whyDangerous: `Elevated current under standard cycle speed indicates increased parasitic friction or supply voltage imbalance.`,
      operatorAction: `Monitor VFD drive bus voltage and verify lubrication feed rate on primary drive bearings.`,
      detectedAt: latestTime,
    });
  }

  // Rule D: Mechanical Overload
  if (machine.load >= loadCrit) {
    activeAnomalies.push({
      id: `${machine.id}-ANOM-LOAD-CRIT`,
      machineId: machine.id,
      machineName: machine.name,
      type: 'MECHANICAL_OVERLOAD',
      title: 'Mechanical Torque Overload Condition',
      severity: 'CRITICAL',
      anomalyScoreContribution: 28,
      triggerSensor: 'Drive Torque & Load Cell Strain Gauge',
      measuredValue: `${machine.load.toFixed(1)}% Load (${machine.powerKw.toFixed(1)} kW)`,
      expectedThreshold: `< ${loadCrit}% Maximum Continuous Load`,
      rateOfChangeLabel: rateLabel,
      whatHappened: `${machine.id} mechanical torque load reached ${machine.load.toFixed(1)}%, operating above the ${loadCrit}% continuous rating ceiling.`,
      whyDangerous: `Operating near 100% mechanical capacity induces structural stress on gearboxes, hydraulic seals, and couplings.`,
      operatorAction: `Reduce feed rate / cycle pressure by 10–15% and inspect workcell tooling resistance.`,
      detectedAt: latestTime,
    });
  } else if (machine.load >= loadWarn) {
    activeAnomalies.push({
      id: `${machine.id}-ANOM-LOAD-WARN`,
      machineId: machine.id,
      machineName: machine.name,
      type: 'MECHANICAL_OVERLOAD',
      title: 'High Mechanical Duty Load',
      severity: 'WARNING',
      anomalyScoreContribution: 14,
      triggerSensor: 'Drive Torque & Load Cell Strain Gauge',
      measuredValue: `${machine.load.toFixed(1)}% Load`,
      expectedThreshold: `≤ ${loadWarn}% Recommended Continuous Load`,
      rateOfChangeLabel: rateLabel,
      whatHappened: `${machine.id} mechanical load is sustained at ${machine.load.toFixed(1)}%.`,
      whyDangerous: `Prolonged high-load operation reduces thermal safety margins and accelerates wear on moving assemblies.`,
      operatorAction: `Verify material feed tolerances and confirm cycle pacing matches standard takt time.`,
      detectedAt: latestTime,
    });
  }

  // Rule E: Unusual RPM Fluctuations
  if (rpmJitterPercent >= 4.8) {
    const isCritRpm = rpmJitterPercent >= 8.5;
    activeAnomalies.push({
      id: `${machine.id}-ANOM-RPM-${isCritRpm ? 'CRIT' : 'WARN'}`,
      machineId: machine.id,
      machineName: machine.name,
      type: 'RPM_FLUCTUATION',
      title: isCritRpm
        ? 'Severe Spindle / Shaft RPM Instability'
        : 'Unusual Rotational RPM Fluctuation',
      severity: isCritRpm ? 'CRITICAL' : 'WARNING',
      anomalyScoreContribution: isCritRpm ? 24 : 15,
      triggerSensor: 'Optical Rotary Shaft Encoder',
      measuredValue: `${machine.rpm.toLocaleString()} RPM (${rpmJitterPercent}% deviation)`,
      expectedThreshold: `${thresholds.nominalRpm.toLocaleString()} RPM (±3.5% window)`,
      rateOfChangeLabel: rateLabel,
      whatHappened: `Rotary encoder detected ${rpmJitterPercent}% speed deviation (${machine.rpm} RPM vs ${thresholds.nominalRpm} RPM nominal).`,
      whyDangerous: `Rotational hunting or speed sag indicates drive belt slip, servo feedback loop oscillation, or torque stall under load.`,
      operatorAction: `Check servo PID velocity loop gains, drive coupling tension, and encoder signal integrity.`,
      detectedAt: latestTime,
    });
  }

  // Rule F: Combined Multi-Sensor Correlation Anomaly
  const distinctAnomalyCategories = new Set(activeAnomalies.map((a) => a.type));
  if (distinctAnomalyCategories.size >= 2) {
    const triggeredList = Array.from(distinctAnomalyCategories).join(' + ');
    const hasCritical = activeAnomalies.some((a) => a.severity === 'CRITICAL');
    activeAnomalies.unshift({
      id: `${machine.id}-ANOM-COMBINED`,
      machineId: machine.id,
      machineName: machine.name,
      type: 'COMBINED_MULTI_SENSOR',
      title: 'Coupled Multi-Sensor Electro-Mechanical Anomaly',
      severity: hasCritical ? 'CRITICAL' : 'WARNING',
      anomalyScoreContribution: 18,
      triggerSensor: 'Multi-Sensor Fusion Rule Engine (Thermal + Kinetic + Electrical)',
      measuredValue: `${machine.temperature.toFixed(1)}°C | ${machine.vibration.toFixed(2)} mm/s | ${machine.current.toFixed(1)} A | ${machine.load.toFixed(0)}%`,
      expectedThreshold: `Simultaneous threshold breach across ${distinctAnomalyCategories.size} sensor domains`,
      rateOfChangeLabel: rateLabel,
      whatHappened: `Correlated multi-domain anomaly detected on ${machine.id} (${triggeredList}). Multiple physical sensors are simultaneously outside nominal bounds.`,
      whyDangerous: `Co-occurring thermal, vibrational, and electrical anomalies strongly indicate a compound mechanical degradation (e.g. bearing drag increasing torque load, current draw, and heat simultaneously).`,
      operatorAction: `Prioritize comprehensive electro-mechanical inspection of ${machine.id}; decouple load or switch to standby cell if anomaly score exceeds 80.`,
      detectedAt: latestTime,
    });
  }

  // 4. Compute Deterministic Anomaly Score (0-100) and Risk Category
  const rawContributionSum = activeAnomalies.reduce(
    (sum, a) => sum + a.anomalyScoreContribution,
    0
  );
  const baselineStress = Math.round((100 - machine.healthScore) * 0.45);
  const anomalyScore = Math.round(clamp(rawContributionSum + baselineStress, 4, 99));

  let riskCategory: RiskCategory = 'NORMAL';
  if (
    anomalyScore >= 75 ||
    machine.status === 'CRITICAL' ||
    activeAnomalies.some((a) => a.severity === 'CRITICAL')
  ) {
    riskCategory = 'CRITICAL';
  } else if (anomalyScore >= 52 || distinctAnomalyCategories.size >= 2) {
    riskCategory = 'HIGH';
  } else if (anomalyScore >= 30 || machine.status === 'WARNING') {
    riskCategory = 'MEDIUM';
  } else if (anomalyScore >= 16) {
    riskCategory = 'LOW';
  }

  const primaryFaultIndicator =
    activeAnomalies.length > 0
      ? activeAnomalies[0].title
      : 'Nominal Electro-Mechanical Signature';

  const detectionExplanation =
    activeAnomalies.length > 0
      ? `${activeAnomalies[0].whatHappened} (${activeAnomalies.length} active detection rule${
          activeAnomalies.length > 1 ? 's' : ''
        } triggered; Anomaly Score ${anomalyScore}/100).`
      : `All 6 telemetry channels on ${machine.id} (${machine.name}) are operating within configured ISO/IEC thresholds. Thermal slope (${tempDeltaPerSec} °C/s) and vibration velocity (${machine.vibration} mm/s) are stable.`;

  return {
    machineId: machine.id,
    machineName: machine.name,
    healthScore: machine.healthScore,
    anomalyScore,
    riskCategory,
    primaryFaultIndicator,
    activeScenario,
    ratesOfChange: {
      tempDeltaPerSec,
      vibDeltaPerSec,
      rpmJitterPercent,
    },
    contributingSensors,
    activeAnomalies,
    detectionExplanation,
  };
}

/**
 * Derives machine-specific Predictive Maintenance Recommendations directly from live intelligence results
 * and merges operator workflow status (OPEN, ACKNOWLEDGED, IN_PROGRESS, RESOLVED).
 * Clearly labels all inspection windows as simulated recommendations.
 */
export function deriveMaintenanceRecommendations(
  machines: MachineTelemetry[],
  intelligenceMap: Record<string, MachineHealthIntelligence>,
  workOrderStatusMap: Record<string, MaintenanceWorkOrderStatus>
): PredictiveMaintenanceRecommendation[] {
  const recommendations: PredictiveMaintenanceRecommendation[] = [];

  for (const m of machines) {
    const intel = intelligenceMap[m.id];
    if (!intel) continue;

    const latestTime = m.history[m.history.length - 1]?.timestamp || '--:--:--';
    const recId = `PM-${m.id}`;
    const existingStatus = workOrderStatusMap[recId] || 'OPEN';

    // Generate recommendation if machine has active anomalies or elevated risk, OR if an operator already interacted with its work order
    const hasRisk =
      intel.activeAnomalies.length > 0 ||
      intel.riskCategory === 'MEDIUM' ||
      intel.riskCategory === 'HIGH' ||
      intel.riskCategory === 'CRITICAL';

    if (!hasRisk && !workOrderStatusMap[recId]) {
      continue;
    }

    let priority: MaintenancePriority = 'LOW';
    let suggestedInspectionWindow = 'Simulated Recommendation: Next Scheduled PM Window (Within 24 Operating Hours)';
    let estimatedOperationalImpact = 'Low throughput risk; early preventive adjustment prevents unscheduled downtime.';

    if (intel.riskCategory === 'CRITICAL') {
      priority = 'IMMEDIATE';
      suggestedInspectionWindow = 'Simulated Recommendation: Immediate Intervention Window (Within 15–30 Minutes)';
      estimatedOperationalImpact = `High risk of thermal/mechanical trip on ${m.position.bay}; potential 18–25% line OEE reduction if left unaddressed.`;
    } else if (intel.riskCategory === 'HIGH') {
      priority = 'HIGH';
      suggestedInspectionWindow = 'Simulated Recommendation: Current Shift Inspection Window (Within 2–4 Hours)';
      estimatedOperationalImpact = `Moderate-to-high component wear rate on ${m.name}; may degrade cycle precision by 8–12%.`;
    } else if (intel.riskCategory === 'MEDIUM') {
      priority = 'MEDIUM';
      suggestedInspectionWindow = 'Simulated Recommendation: Upcoming Shift Handover Window (Within 8 Hours)';
      estimatedOperationalImpact = `Minor efficiency drag (${(100 - m.efficiency).toFixed(1)}% loss); no immediate line stoppage expected.`;
    }

    const primaryAnomaly = intel.activeAnomalies[0];
    const triggeringSensors = intel.contributingSensors
      .filter((s) => s.severity !== 'NOMINAL')
      .map((s) => `${s.label} (${s.measuredValue})`);

    const title = primaryAnomaly
      ? `${primaryAnomaly.title} — Preventive Service`
      : `Routine Condition Stabilization (${m.name})`;

    const recommendedAction = primaryAnomaly
      ? primaryAnomaly.operatorAction
      : `Condition recovered to nominal envelope (${m.temperature.toFixed(1)}°C, ${m.vibration.toFixed(2)} mm/s). Verify sensor baseline and close work order.`;

    recommendations.push({
      id: recId,
      machineId: m.id,
      machineName: m.name,
      bay: m.position.bay,
      priority,
      status: existingStatus,
      faultCategory: primaryAnomaly ? primaryAnomaly.type.replace(/_/g, ' ') : 'CONDITION MONITORED',
      title,
      recommendedAction,
      suggestedInspectionWindow,
      estimatedOperationalImpact,
      triggeringSensors:
        triggeringSensors.length > 0
          ? triggeringSensors
          : [`All sensors nominal (${m.temperature.toFixed(1)}°C, ${m.vibration.toFixed(2)} mm/s)`],
      anomalyScore: intel.anomalyScore,
      healthScore: intel.healthScore,
      updatedAt: latestTime,
      isConditionActive: hasRisk,
    });
  }

  const priorityRank: Record<MaintenancePriority, number> = {
    IMMEDIATE: 0,
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
  };

  return recommendations.sort((a, b) => {
    if (priorityRank[a.priority] !== priorityRank[b.priority]) {
      return priorityRank[a.priority] - priorityRank[b.priority];
    }
    return b.anomalyScore - a.anomalyScore;
  });
}

export function summarizeFactoryIntelligence(
  intelligenceList: MachineHealthIntelligence[],
  maintenanceList: PredictiveMaintenanceRecommendation[]
): IntelligenceOverviewSummary {
  const riskDistribution: Record<RiskCategory, number> = {
    NORMAL: 0,
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
    CRITICAL: 0,
  };

  let machinesAtRiskCount = 0;
  let activeAnomaliesCount = 0;
  let criticalMachineCount = 0;
  let totalAnomalyScore = 0;

  for (const item of intelligenceList) {
    riskDistribution[item.riskCategory] += 1;
    totalAnomalyScore += item.anomalyScore;
    activeAnomaliesCount += item.activeAnomalies.length;

    if (
      item.riskCategory === 'MEDIUM' ||
      item.riskCategory === 'HIGH' ||
      item.riskCategory === 'CRITICAL'
    ) {
      machinesAtRiskCount += 1;
    }
    if (item.riskCategory === 'CRITICAL') {
      criticalMachineCount += 1;
    }
  }

  const openMaintenanceCount = maintenanceList.filter(
    (m) => m.status !== 'RESOLVED'
  ).length;

  return {
    machinesAtRiskCount,
    activeAnomaliesCount,
    criticalMachineCount,
    averageAnomalyScore:
      intelligenceList.length > 0
        ? Math.round(totalAnomalyScore / intelligenceList.length)
        : 0,
    openMaintenanceCount,
    riskDistribution,
  };
}
