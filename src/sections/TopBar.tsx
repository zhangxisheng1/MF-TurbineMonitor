import dayjs from 'dayjs';

export function TopBar({ now, selected, status }: { now: number; selected: string; status: string }) {
  return (
    <header className="grid grid-cols-6 items-center gap-3 rounded-xl border border-border bg-panel px-4 py-3 text-sm text-slate-100 shadow-glow">
      <div className="col-span-2 text-xl font-semibold text-cyan-200">风机疲劳数字孪生驾驶舱</div>
      <div>{dayjs(now).format('YYYY-MM-DD HH:mm:ss')}</div>
      <div>天气: 多云 / 17°C</div>
      <div>风场状态: {status}</div>
      <div>选中机组: {selected}</div>
    </header>
  );
}
