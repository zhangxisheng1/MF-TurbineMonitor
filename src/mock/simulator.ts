import { levelScore } from '@/lib/utils';
import { simulatorConfig } from './config';
import { initTurbine, nextSnapshot, type TurbineInternal } from './generators';
import type { FarmState } from './types';

export class WindFarmSimulator {
  private turbines: TurbineInternal[];

  public state: FarmState;

  constructor() {
    this.turbines = Array.from({ length: simulatorConfig.turbineCount }, (_, idx) => initTurbine(idx));
    this.state = {
      now: Date.now(),
      turbines: [],
      history: {},
      alarms: [],
      targetPower: simulatorConfig.turbineCount * simulatorConfig.ratedPowerMW * 0.74,
      actualPower: 0,
      recommendation: '系统处于演示仿真模式，建议维持平衡优先策略。',
      highRiskTurbines: [],
      isDerating: false,
      redistribution: [],
    };
    this.step(1);
  }

  step(dt = 1) {
    const now = Date.now();
    const turbineSnapshots = this.turbines.map((t) => nextSnapshot(t, now, dt, simulatorConfig.ratedPowerMW));

    const turbines = turbineSnapshots.map((x) => x.snapshot);
    const alarms = turbineSnapshots.flatMap((x) => x.alarms);
    const actualPower = turbines.reduce((sum, t) => sum + t.power, 0);

    const highRiskTurbines = turbines
      .filter((t) => levelScore(t.alarmLevel) >= 3 || t.controlMode === '降载保护')
      .map((t) => t.turbineId);

    const isDerating = highRiskTurbines.length > 0;
    const targetPower = (simulatorConfig.turbineCount * simulatorConfig.ratedPowerMW) * (isDerating ? 0.67 : 0.78);

    const redistribution = turbines.map((t) => {
      const risk = levelScore(t.alarmLevel);
      const ratio = risk >= 3 ? 0.84 : risk === 2 ? 0.95 : 1.05;
      return {
        turbineId: t.turbineId,
        basePower: t.power,
        adjustedPower: Math.max(0, t.power * ratio),
      };
    });

    const recommendation = isDerating
      ? '检测到高风险机组，建议执行疲劳保护与场级功率重分配。'
      : '机组风险可控，建议采用平衡优先提高场级稳定性。';

    const history = { ...this.state.history };
    for (const s of turbines) {
      history[s.turbineId] = [...(history[s.turbineId] || []), s].slice(-simulatorConfig.historyLimit);
    }

    this.state = {
      now,
      turbines,
      history,
      alarms: [...alarms, ...this.state.alarms].slice(0, 160),
      targetPower,
      actualPower,
      recommendation,
      highRiskTurbines,
      isDerating,
      redistribution,
    };

    return this.state;
  }
}
