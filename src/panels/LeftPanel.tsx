import type { AlarmEvent, TurbineSnapshot } from '@/mock/types';
import { ChartPanel, MetricItem, PanelCard } from '@/components';
import { chartColor } from '@/config/theme';

const baseAxis = { axisLine: { lineStyle: { color: '#2f5f8d' } }, axisLabel: { color: '#9ec9e8' }, splitLine: { lineStyle: { color: 'rgba(80,120,160,0.25)' } } };

export function LeftPanel({ selected, history, turbines, alarms, onSelectAlarm, onSelectTurbine, highlightMetric }: {
  selected: TurbineSnapshot;
  history: TurbineSnapshot[];
  turbines: TurbineSnapshot[];
  alarms: AlarmEvent[];
  onSelectAlarm: (id: string) => void;
  onSelectTurbine: (id: string) => void;
  highlightMetric: (m: string) => void;
}) {
  const labels = history.map((x) => new Date(x.timestamp).toLocaleTimeString('zh-CN', { minute: '2-digit', second: '2-digit' }));
  return (
    <div className="space-y-3">
      <PanelCard title="运行总览">
        <div className="grid grid-cols-2 gap-2">
          <MetricItem label="风速" value={selected.windSpeed.toFixed(2)} unit="m/s" onClick={() => highlightMetric('windSpeed')} />
          <MetricItem label="风向" value={selected.windDirection.toFixed(1)} unit="°" />
          <MetricItem label="转速" value={selected.rotorSpeed.toFixed(2)} unit="rpm" onClick={() => highlightMetric('rotorSpeed')} />
          <MetricItem label="功率" value={selected.power.toFixed(2)} unit="MW" accent="text-emerald-300" onClick={() => highlightMetric('power')} />
        </div>
      </PanelCard>

      <ChartPanel
        title="风速 / 转速 / 功率趋势"
        option={{
          tooltip: { trigger: 'axis' },
          legend: { textStyle: { color: '#b6e4ff' }, top: 0 },
          grid: { left: 32, right: 10, top: 28, bottom: 20 },
          xAxis: { type: 'category', data: labels, ...baseAxis },
          yAxis: [{ type: 'value', ...baseAxis }, { type: 'value', ...baseAxis }],
          series: [
            { name: '风速', type: 'line', smooth: true, data: history.map((h) => h.windSpeed), lineStyle: { color: chartColor.cyan } },
            { name: '转速', type: 'line', smooth: true, data: history.map((h) => h.rotorSpeed), lineStyle: { color: chartColor.blue } },
            { name: '功率', type: 'line', yAxisIndex: 1, smooth: true, data: history.map((h) => h.power), lineStyle: { color: chartColor.green } },
          ],
        }}
      />

      <PanelCard title="机组列表">
        <div className="max-h-48 space-y-1 overflow-auto pr-1 text-xs">
          {turbines.map((t) => (
            <button key={t.turbineId} type="button" onClick={() => onSelectTurbine(t.turbineId)} className={`flex w-full justify-between rounded px-2 py-1 ${t.turbineId === selected.turbineId ? 'bg-cyan-500/30 text-cyan-100' : 'bg-slate-900/40 text-slate-300'}`}>
              <span>{t.turbineId}</span><span>{t.alarmLevel}</span>
            </button>
          ))}
        </div>
      </PanelCard>

      <PanelCard title="实时事件流 / 告警滚动">
        <div className="max-h-44 space-y-1 overflow-auto text-xs">
          {alarms.slice(0, 12).map((a) => (
            <button type="button" key={a.id} onClick={() => onSelectAlarm(a.turbineId)} className="w-full rounded bg-slate-900/50 p-2 text-left text-slate-200 hover:bg-slate-800/60">
              [{a.level}] {a.turbineId} - {a.message}
            </button>
          ))}
        </div>
      </PanelCard>
    </div>
  );
}
