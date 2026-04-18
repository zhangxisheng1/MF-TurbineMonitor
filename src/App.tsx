import { useMemo, useState } from 'react';
import { useSimulator } from '@/hooks';
import type { ViewMode } from '@/mock/types';
import { TopBar } from '@/sections/TopBar';
import { LeftPanel } from '@/panels/LeftPanel';
import { RightPanel } from '@/panels/RightPanel';
import { BottomControl } from '@/sections/BottomControl';
import { CentralTwin } from '@/sections/CentralTwin';
import { ChartPanel } from '@/components';
import { chartColor } from '@/config/theme';

const axis = { axisLine: { lineStyle: { color: '#2f5f8d' } }, axisLabel: { color: '#9ec9e8' }, splitLine: { lineStyle: { color: 'rgba(80,120,160,0.25)' } } };

function App() {
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [view, setView] = useState<ViewMode>('overview');
  const [windowMin, setWindowMin] = useState(5);
  const [selectedId, setSelectedId] = useState('WT-01');
  const [highlight, setHighlight] = useState('');
  const farm = useSimulator(running, speed);

  const selected = farm.turbines.find((t) => t.turbineId === selectedId) || farm.turbines[0];
  const history = useMemo(() => {
    if (!selected) return [];
    const all = farm.history[selected.turbineId] || [];
    const count = Math.min(all.length, windowMin * 12 * speed);
    return all.slice(-Math.max(count, 20));
  }, [farm.history, selected, windowMin, speed]);

  if (!selected) return null;

  const status = farm.isDerating ? '降载保护中' : '稳定运行';
  const labels = farm.turbines.map((t) => t.turbineId);

  return (
    <main className="flex h-full flex-col gap-3 p-3">
      <TopBar now={farm.now} selected={selected.turbineId} status={status} />

      <section className="grid min-h-0 flex-1 grid-cols-[360px_minmax(0,1fr)_420px] gap-3">
        <LeftPanel
          selected={selected}
          history={history}
          turbines={farm.turbines}
          alarms={farm.alarms}
          onSelectAlarm={setSelectedId}
          onSelectTurbine={setSelectedId}
          highlightMetric={setHighlight}
        />

        <div className="grid min-h-0 grid-rows-[minmax(0,1fr)_240px] gap-3">
          <CentralTwin selected={selected} risk={selected.alarmLevel} />
          <div className="grid grid-cols-3 gap-3">
            <ChartPanel
              title="场级目标功率 vs 实际总功率"
              option={{ tooltip: {}, xAxis: { type: 'category', data: ['目标', '实际'], ...axis }, yAxis: { type: 'value', ...axis }, grid: { left: 30, right: 10, top: 10, bottom: 24 }, series: [{ type: 'bar', data: [{ value: farm.targetPower, itemStyle: { color: chartColor.blue } }, { value: farm.actualPower, itemStyle: { color: chartColor.green } }] }] }}
              height={200}
            />
            <ChartPanel
              title="风机群风险分布图"
              option={{ tooltip: {}, xAxis: { type: 'category', data: labels, axisLabel: { rotate: 45, color: '#9ec9e8' }, axisLine: { lineStyle: { color: '#2f5f8d' } } }, yAxis: { type: 'value', ...axis }, grid: { left: 30, right: 8, top: 10, bottom: 44 }, series: [{ type: 'bar', data: farm.turbines.map((t) => ({ value: t.damageRate, itemStyle: { color: t.alarmLevel === 'critical' ? chartColor.red : t.alarmLevel === 'warning' ? chartColor.orange : chartColor.cyan } })) }] }}
              height={200}
            />
            <ChartPanel
              title="单机功率重分配对比"
              option={{ tooltip: { trigger: 'axis' }, legend: { textStyle: { color: '#b6e4ff' } }, xAxis: { type: 'category', data: labels, axisLabel: { rotate: 45, color: '#9ec9e8' }, axisLine: { lineStyle: { color: '#2f5f8d' } } }, yAxis: { type: 'value', ...axis }, grid: { left: 30, right: 10, top: 28, bottom: 44 }, series: [{ name: '原始功率', type: 'line', data: farm.redistribution.map((r) => r.basePower), lineStyle: { color: chartColor.blue } }, { name: '调整后', type: 'line', data: farm.redistribution.map((r) => r.adjustedPower), lineStyle: { color: chartColor.orange } }] }}
              height={200}
            />
          </div>
        </div>

        <RightPanel selected={selected} history={history} farm={farm} onMetric={setHighlight} />
      </section>

      <BottomControl
        view={view}
        setView={setView}
        running={running}
        setRunning={setRunning}
        speed={speed}
        setSpeed={setSpeed}
        windowMin={windowMin}
        setWindowMin={setWindowMin}
      />

      {highlight && <div className="absolute right-5 top-20 rounded bg-cyan-600/30 px-3 py-1 text-xs text-cyan-100">联动高亮: {highlight}</div>}
    </main>
  );
}

export default App;
