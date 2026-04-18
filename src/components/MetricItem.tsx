export function MetricItem({ label, value, unit, accent = 'text-cyan-100', onClick }: { label: string; value: string; unit?: string; accent?: string; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-end justify-between rounded-md bg-slate-900/45 p-2 text-left hover:bg-slate-800/60">
      <span className="text-xs text-slate-300">{label}</span>
      <span className={`text-lg font-semibold ${accent}`}>{value}<span className="ml-1 text-xs text-slate-300">{unit}</span></span>
    </button>
  );
}
