import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { MonthlySpend } from '@/types';
import { formatCompactCurrency, formatMonthKey } from '@/utils/format';
import { ChartTooltip } from './ChartTooltip';

interface Props {
  data: MonthlySpend[];
  /** The month rendered in the accent colour. */
  activeMonth: string;
  height?: number;
}

export function MonthlySpendChart({ data, activeMonth, height = 260 }: Props) {
  const chartData = data.map((item) => ({
    ...item,
    label: formatMonthKey(item.month, 'short').split(' ')[0],
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} margin={{ top: 8, right: 4, left: -18, bottom: 0 }} barCategoryGap="32%">
        <CartesianGrid vertical={false} stroke="#EDEFF3" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fill: '#9AA2B1', fontSize: 12, fontWeight: 600 }}
          dy={6}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={64}
          tick={{ fill: '#9AA2B1', fontSize: 11 }}
          tickFormatter={(value: number) => formatCompactCurrency(value)}
        />
        <Tooltip
          cursor={{ fill: '#F4F5F7' }}
          content={<ChartTooltip labelFormatter={(label) => `${label} spending`} />}
        />
        <Bar dataKey="amount" radius={[6, 6, 6, 6]} maxBarSize={44}>
          {chartData.map((item) => (
            <Cell key={item.month} fill={item.month === activeMonth ? '#4F46E5' : '#E4E2FD'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
