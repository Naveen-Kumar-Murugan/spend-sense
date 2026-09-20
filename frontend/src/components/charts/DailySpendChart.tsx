import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { DailySpend } from '@/types';
import { formatCompactCurrency, formatDate } from '@/utils/format';
import { ChartTooltip } from './ChartTooltip';

export function DailySpendChart({ data, height = 220 }: { data: DailySpend[]; height?: number }) {
  const chartData = data.map((item) => ({ ...item, label: Number(item.date.slice(-2)) }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="dailySpendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.22} />
            <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#EDEFF3" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
          minTickGap={18}
          tick={{ fill: '#9AA2B1', fontSize: 11 }}
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
          cursor={{ stroke: '#C9C5FB', strokeWidth: 1 }}
          content={
            <ChartTooltip
              labelFormatter={(label) => {
                const point = chartData.find((item) => String(item.label) === label);
                return point ? formatDate(point.date) : label;
              }}
            />
          }
        />
        <Area
          type="monotone"
          dataKey="amount"
          stroke="#4F46E5"
          strokeWidth={2.5}
          fill="url(#dailySpendFill)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
