export type AlarmLevel = 'normal' | 'attention' | 'warning' | 'critical';
export type ViewMode = 'overview' | 'monitor' | 'fatigue' | 'control' | 'replay';
export type ControlMode = '正常运行' | '平衡优先' | '疲劳保护' | '降载保护';

export interface TurbineSnapshot {
  timestamp: number;
  turbineId: string;
  windSpeed: number;
  windDirection: number;
  ambientTemp: number;
  turbulenceIntensity: number;
  rotorSpeed: number;
  pitchAngle: number;
  power: number;
  shaftTorque: number;
  towerThrust: number;
  fatigueEquivalentLoad: number;
  cumulativeDamage: number;
  damageRate: number;
  healthScore: number;
  remainingLife: number;
  nacelleTemp: number;
  generatorTemp: number;
  gearboxTemp: number;
  controlMode: ControlMode;
  alarmLevel: AlarmLevel;
}

export interface AlarmEvent {
  id: string;
  timestamp: number;
  turbineId: string;
  level: AlarmLevel;
  message: string;
  metric: string;
}

export interface FarmState {
  now: number;
  turbines: TurbineSnapshot[];
  history: Record<string, TurbineSnapshot[]>;
  alarms: AlarmEvent[];
  targetPower: number;
  actualPower: number;
  recommendation: string;
  highRiskTurbines: string[];
  isDerating: boolean;
  redistribution: Array<{ turbineId: string; basePower: number; adjustedPower: number }>;
}
