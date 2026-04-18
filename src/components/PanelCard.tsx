import { PropsWithChildren } from 'react';

export function PanelCard({ title, children, className = '' }: PropsWithChildren<{ title: string; className?: string }>) {
  return (
    <section className={`rounded-xl border border-border bg-panel p-3 shadow-glow backdrop-blur ${className}`}>
      <h3 className="mb-2 text-sm font-semibold tracking-wide text-cyan-200">{title}</h3>
      {children}
    </section>
  );
}
