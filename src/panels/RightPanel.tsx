import { ChartPanel, MetricItem, PanelCard } from '@/components';
import { chartColor } from '@/config/theme';
import type { FarmState, TurbineSnapshot } from '@/mock/types';

const baseAxis = { axisLine: { lineStyle: { color: '#2f5f8d' } }, axisLabel: { color: '#9ec9e8' }, splitLine: { lineStyle: { color: 'rgba(80,120,160,0.25)' } } };

export function RightPanel({ selected, history, farm, onMetric }: { selected: TurbineSnapshot; history: TurbineSnapshot[]; farm: FarmState; onMetric: (m: string) => void }) {
  const labels = history.map((x) => new Date(x.timestamp).toLocaleTimeString('zh-CN', { minute: '2-digit', second: '2-digit' }));
  return (
    <div className="space-y-3">
      <PanelCard title="疲劳指标 / 健康状态">
        <div className="grid grid-cols-2 gap-2">
          <MetricItem label="等效疲劳载荷" value={selected.fatigueEquivalentLoad.toFixed(1)} onClick={() => onMetric('fatigueEquivalentLoad')} />
          <MetricItem label="累计损伤" value={selected.cumulativeDamage.toFixed(4)} accent="text-amber-300" onClick={() => onMetric('cumulativeDamage')} />
          <MetricItem label="损伤速率" value={selected.damageRate.toFixed(4)} onClick={() => onMetric('damageRate')} />
          <MetricItem label="健康度" value={selected.healthScore.toFixed(1)} unit="%" accent="text-emerald-300" />
          <MetricItem label="剩余寿命" value={selected.remainingLife.toFixed(2)} unit="年" />
          <MetricItem label="风险等级" value={selected.alarmLevel} accent="text-orange-300" />
        </div>
      </PanelCard>

      <ChartPanel title="主轴扭矩趋势图" option={{ tooltip: { trigger: 'axis' }, grid: { left: 35, right: 8, top: 10, bottom: 24 }, xAxis: { type: 'category', data: labels, ...baseAxis }, yAxis: { type: 'value', ...baseAxis }, series: [{ type: 'line', smooth: true, data: history.map((h) => h.shaftTorque), lineStyle: { color: chartColor.orange } }] }} />
      <ChartPanel title="塔架推力趋势图" option={{ tooltip: { trigger: 'axis' }, grid: { left: 35, right: 8, top: 10, bottom: 24 }, xAxis: { type: 'category', data: labels, ...baseAxis }, yAxis: { type: 'value', ...baseAxis }, series: [{ type: 'line', smooth: true, data: history.map((h) => h.towerThrust), lineStyle: { color: chartColor.blue } }] }} />
      <ChartPanel title="疲劳载荷/累计损伤/损伤速率" option={{ tooltip: { trigger: 'axis' }, legend: { textStyle: { color: '#b6e4ff' } }, grid: { left: 35, right: 8, top: 28, bottom: 24 }, xAxis: { type: 'category', data: labels, ...baseAxis }, yAxis: [{ type: 'value', ...baseAxis }, { type: 'value', ...baseAxis }], series: [{ name: '等效疲劳载荷', type: 'line', data: history.map((h) => h.fatigueEquivalentLoad), lineStyle: { color: chartColor.cyan } }, { name: '累计损伤', type: 'line', yAxisIndex: 1, data: history.map((h) => h.cumulativeDamage), lineStyle: { color: chartColor.red } }, { name: '损伤速率', type: 'line', yAxisIndex: 1, data: history.map((h) => h.damageRate), lineStyle: { color: chartColor.orange } }] }} />

      <PanelCard title="温度分布卡片 / 调控状态">
        <div className="space-y-2 text-sm text-slate-100">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="rounded bg-slate-900/50 p-2">机舱: {selected.nacelleTemp.toFixed(1)}°C</div>
            <div className="rounded bg-slate-900/50 p-2">发电机: {selected.generatorTemp.toFixed(1)}°C</div>
            <div className="rounded bg-slate-900/50 p-2">齿轮箱: {selected.gearboxTemp.toFixed(1)}°C</div>
          </div>
          <div>调控模式: <span className="text-cyan-300">{selected.controlMode}</span></div>
          <div>场级目标功率: {farm.targetPower.toFixed(2)} MW / 实际总功率: {farm.actualPower.toFixed(2)} MW</div>
          <div>跟踪偏差: {(farm.actualPower - farm.targetPower).toFixed(2)} MW</div>
          <div className="text-cyan-200">建议: {farm.recommendation}</div>
          <div>高风险机组: {farm.highRiskTurbines.length ? farm.highRiskTurbines.join(', ') : '无'}</div>
        </div>
      </PanelCard>
    </div>
  );
}
