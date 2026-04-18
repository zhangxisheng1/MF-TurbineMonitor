import type { EChartsCoreOption } from 'echarts';
import { useEChart } from '@/hooks';
import { PanelCard } from './PanelCard';

export function ChartPanel({ title, option, height = 170 }: { title: string; option: EChartsCoreOption; height?: number }) {
  const ref = useEChart(option);
  return (
    <PanelCard title={title}>
      <div ref={ref} style={{ height }} />
    </PanelCard>
  );
}
