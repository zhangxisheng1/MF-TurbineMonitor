import { clamp, lerp, wrap360 } from '@/lib/utils';
import type { AlarmEvent, AlarmLevel, ControlMode, TurbineSnapshot } from './types';

export interface TurbineInternal {
  id: string;
  seed: number;
  windSpeed: number;
  windDirection: number;
  ambientTemp: number;
  turbulenceIntensity: number;
  rotorSpeed: number;
  pitchAngle: number;
  cumulativeDamage: number;
  healthScore: number;
  remainingLife: number;
  nacelleTemp: number;
  generatorTemp: number;
  gearboxTemp: number;
  prevTorque: number;
  prevThrust: number;
}

const riskLevel = (s: TurbineSnapshot): AlarmLevel => {
  if (s.damageRate > 0.05 || s.generatorTemp > 90 || s.cumulativeDamage > 0.85) return 'critical';
  if (s.damageRate > 0.04 || s.towerThrust > 980 || s.shaftTorque > 4200) return 'warning';
  if (s.damageRate > 0.03 || s.windSpeed > 14 || s.generatorTemp > 84) return 'attention';
  return 'normal';
};

const controlModeOf = (s: TurbineSnapshot): ControlMode => {
  if (s.alarmLevel === 'critical' || s.generatorTemp > 92) return '降载保护';
  if (s.cumulativeDamage > 0.75 || s.damageRate > 0.045) return '疲劳保护';
  if (s.alarmLevel === 'attention' || s.alarmLevel === 'warning') return '平衡优先';
  return '正常运行';
};

const createAlarm = (s: TurbineSnapshot): AlarmEvent[] => {
  const list: AlarmEvent[] = [];
  if (s.windSpeed > 14) list.push({ id: `${s.turbineId}-hws-${s.timestamp}`, timestamp: s.timestamp, turbineId: s.turbineId, level: 'attention', metric: 'windSpeed', message: '风速偏高，建议增加桨距角' });
  if (s.towerThrust > 980) list.push({ id: `${s.turbineId}-thrust-${s.timestamp}`, timestamp: s.timestamp, turbineId: s.turbineId, level: 'warning', metric: 'towerThrust', message: '塔架推力异常升高' });
  if (s.shaftTorque > 4200) list.push({ id: `${s.turbineId}-torque-${s.timestamp}`, timestamp: s.timestamp, turbineId: s.turbineId, level: 'warning', metric: 'shaftTorque', message: '主轴扭矩过大' });
  if (s.damageRate > 0.05) list.push({ id: `${s.turbineId}-dr-${s.timestamp}`, timestamp: s.timestamp, turbineId: s.turbineId, level: 'critical', metric: 'damageRate', message: '损伤速率偏高，触发疲劳保护' });
  if (s.generatorTemp > 90 || s.gearboxTemp > 85) list.push({ id: `${s.turbineId}-temp-${s.timestamp}`, timestamp: s.timestamp, turbineId: s.turbineId, level: 'critical', metric: 'temperature', message: '温度异常，建议降载' });
  if (s.controlMode === '平衡优先' && s.turbulenceIntensity > 0.28) list.push({ id: `${s.turbineId}-osc-${s.timestamp}`, timestamp: s.timestamp, turbineId: s.turbineId, level: 'attention', metric: 'control', message: '调控振荡风险上升' });
  return list;
};

export const initTurbine = (idx: number): TurbineInternal => ({
  id: `WT-${String(idx + 1).padStart(2, '0')}`,
  seed: idx * 0.47,
  windSpeed: 8 + idx * 0.12,
  windDirection: 220 + idx,
  ambientTemp: 17 - idx * 0.15,
  turbulenceIntensity: 0.12,
  rotorSpeed: 11.2,
  pitchAngle: 2.8,
  cumulativeDamage: 0.12 + idx * 0.01,
  healthScore: 96 - idx * 0.8,
  remainingLife: 18 - idx * 0.2,
  nacelleTemp: 42,
  generatorTemp: 55,
  gearboxTemp: 52,
  prevTorque: 3000,
  prevThrust: 640,
});

export const nextSnapshot = (state: TurbineInternal, now: number, dt: number, ratedPowerMW: number) => {
  const t = now / 1000;
  const trend = 8.8 + 2.2 * Math.sin(t / 95 + state.seed) + 1.1 * Math.sin(t / 31 + state.seed * 1.6);
  state.windSpeed = lerp(state.windSpeed, clamp(trend, 4, 16.5), 0.08 * dt);
  state.windDirection = wrap360(state.windDirection + (Math.sin(t / 120 + state.seed) * 0.9 + 0.3) * dt);
  state.ambientTemp = lerp(state.ambientTemp, 16 + Math.sin(t / 600) * 2.4, 0.01 * dt);
  const windPerturb = Math.abs(state.windSpeed - trend);
  state.turbulenceIntensity = clamp(0.08 + windPerturb * 0.04 + (Math.sin(t / 24 + state.seed) + 1) * 0.03, 0.05, 0.32);

  const targetRotor = clamp(5 + state.windSpeed * 0.95, 6, 16);
  state.rotorSpeed = lerp(state.rotorSpeed, targetRotor, 0.11 * dt);

  const highWindPitch = clamp((state.windSpeed - 11.2) * 1.8, 0, 15);
  state.pitchAngle = lerp(state.pitchAngle, 1.8 + highWindPitch, 0.12 * dt);

  const norm = clamp((state.windSpeed - 3.5) / (12 - 3.5), 0, 1.25);
  const cp = clamp(0.45 - state.pitchAngle * 0.01, 0.24, 0.47);
  let power = ratedPowerMW * Math.min(norm ** 3 * cp / 0.45, 1.03);
  if (state.windSpeed > 14.8) power *= 0.92;
  power = clamp(power, 0, ratedPowerMW * 1.02);

  const torque = lerp(state.prevTorque, (power * 9550) / Math.max(state.rotorSpeed, 1), 0.2 * dt);
  const thrust = lerp(state.prevThrust, clamp(260 + state.windSpeed ** 2 * 4.2 + state.turbulenceIntensity * 280, 300, 1200), 0.16 * dt);
  state.prevTorque = torque;
  state.prevThrust = thrust;

  const eqLoad = clamp(210 + Math.abs(torque - state.prevTorque) * 0.6 + Math.abs(thrust - state.prevThrust) * 0.35 + state.turbulenceIntensity * 900, 180, 620);
  const damageRate = clamp(0.012 + (eqLoad - 220) * 0.00009 + Math.max(0, thrust - 900) * 0.00002, 0.01, 0.075);
  state.cumulativeDamage = clamp(state.cumulativeDamage + damageRate * dt / 3600 / 2.2, 0, 1);
  state.healthScore = clamp(100 - state.cumulativeDamage * 62, 30, 100);
  state.remainingLife = clamp(20 * (state.healthScore / 100), 4.2, 20);

  state.nacelleTemp = lerp(state.nacelleTemp, 36 + power * 5 + state.turbulenceIntensity * 16, 0.08 * dt);
  state.generatorTemp = lerp(state.generatorTemp, 48 + power * 8 + (torque / 1000) * 2.4, 0.08 * dt);
  state.gearboxTemp = lerp(state.gearboxTemp, 45 + power * 7 + state.turbulenceIntensity * 8, 0.07 * dt);

  const basic: TurbineSnapshot = {
    timestamp: now,
    turbineId: state.id,
    windSpeed: state.windSpeed,
    windDirection: state.windDirection,
    ambientTemp: state.ambientTemp,
    turbulenceIntensity: state.turbulenceIntensity,
    rotorSpeed: state.rotorSpeed,
    pitchAngle: state.pitchAngle,
    power,
    shaftTorque: torque,
    towerThrust: thrust,
    fatigueEquivalentLoad: eqLoad,
    cumulativeDamage: state.cumulativeDamage,
    damageRate,
    healthScore: state.healthScore,
    remainingLife: state.remainingLife,
    nacelleTemp: state.nacelleTemp,
    generatorTemp: state.generatorTemp,
    gearboxTemp: state.gearboxTemp,
    controlMode: '正常运行',
    alarmLevel: 'normal',
  };

  basic.alarmLevel = riskLevel(basic);
  basic.controlMode = controlModeOf(basic);
  const alarms = createAlarm(basic);
  return { snapshot: basic, alarms };
};
