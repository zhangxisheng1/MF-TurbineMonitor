import type { ViewMode } from '@/mock/types';

const views: Array<{ key: ViewMode; label: string }> = [
  { key: 'overview', label: '总览视图' },
  { key: 'monitor', label: '监测视图' },
  { key: 'fatigue', label: '疲劳视图' },
  { key: 'control', label: '调控视图' },
  { key: 'replay', label: '回放视图' },
];

export function BottomControl({ view, setView, running, setRunning, speed, setSpeed, windowMin, setWindowMin }: {
  view: ViewMode;
  setView: (v: ViewMode) => void;
  running: boolean;
  setRunning: (v: boolean) => void;
  speed: number;
  setSpeed: (s: number) => void;
  windowMin: number;
  setWindowMin: (w: number) => void;
}) {
  return (
    <footer className="flex items-center justify-between rounded-xl border border-border bg-panel px-4 py-3 text-sm text-slate-100 shadow-glow">
      <div className="flex gap-2">
        {views.map((v) => <button key={v.key} type="button" className={`rounded px-3 py-1 ${view === v.key ? 'bg-cyan-500/40 text-cyan-100' : 'bg-slate-800/70'}`} onClick={() => setView(v.key)}>{v.label}</button>)}
      </div>
      <div className="flex items-center gap-2">
        <button type="button" className="rounded bg-slate-800/70 px-3 py-1" onClick={() => setRunning(!running)}>{running ? '暂停仿真' : '继续仿真'}</button>
        <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="rounded bg-slate-800 px-2 py-1"><option value={1}>1x</option><option value={2}>2x</option><option value={4}>4x</option></select>
        <select value={windowMin} onChange={(e) => setWindowMin(Number(e.target.value))} className="rounded bg-slate-800 px-2 py-1"><option value={1}>1分钟</option><option value={5}>5分钟</option><option value={15}>15分钟</option></select>
      </div>
    </footer>
  );
}
