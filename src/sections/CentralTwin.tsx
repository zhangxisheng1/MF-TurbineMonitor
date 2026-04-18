import type { TurbineSnapshot } from '@/mock/types';

export function CentralTwin({ selected, risk }: { selected: TurbineSnapshot; risk: string }) {
  const color = risk === 'critical' ? 'from-red-500/70' : risk === 'warning' ? 'from-orange-400/70' : 'from-cyan-400/70';
  return (
    <section className="relative h-full overflow-hidden rounded-xl border border-border bg-gradient-to-b from-slate-950 via-blue-950/30 to-slate-900 shadow-glow">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(34,211,238,0.2),transparent_45%)]" />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(56,189,248,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.35)_1px,transparent_1px)] [background-size:36px_36px]" />
      <div className="absolute inset-x-0 top-0 h-16 animate-scan bg-gradient-to-b from-cyan-300/20 to-transparent" />
      <div className="absolute left-1/2 top-[52%] h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/25" />
      <div className="absolute left-1/2 top-[52%] h-64 w-64 -translate-x-1/2 -translate-y-1/2 animate-float rounded-full border border-cyan-400/35" />
      <div className="absolute left-1/2 top-[57%] h-[250px] w-[6px] -translate-x-1/2 rounded bg-cyan-200/80 shadow-[0_0_30px_rgba(34,211,238,0.9)]" />
      <div className="absolute left-1/2 top-[35%] h-[3px] w-40 -translate-x-1/2 rounded bg-cyan-100" />
      <div className="absolute left-[calc(50%-130px)] top-[35%] h-[3px] w-36 -rotate-[28deg] rounded bg-cyan-100" />
      <div className="absolute left-[calc(50%+4px)] top-[35%] h-[3px] w-36 rotate-[28deg] rounded bg-cyan-100" />
      <div className={`absolute bottom-5 left-5 right-5 rounded-xl border border-cyan-300/35 bg-gradient-to-r ${color} to-transparent p-3 text-sm text-slate-100`}>
        <div className="font-semibold">主机组 {selected.turbineId} 数字孪生焦点</div>
        <div className="mt-1 grid grid-cols-4 gap-2 text-xs">
          <span>风速 {selected.windSpeed.toFixed(2)} m/s</span>
          <span>转速 {selected.rotorSpeed.toFixed(2)} rpm</span>
          <span>功率 {selected.power.toFixed(2)} MW</span>
          <span>健康度 {selected.healthScore.toFixed(1)}%</span>
        </div>
      </div>
    </section>
  );
}
