import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { CategorySpend } from '@/types';
import { CATEGORY_META } from '@/constants/categories';
import { formatCompactCurrency } from '@/utils/format';
import { ChartTooltip } from './ChartTooltip';

interface Props {
  data: CategorySpend[];
  total: number;
  height?: number;
}

export function CategoryDonutChart({ data, total, height = 240 }: Props) {
  const slices = data.slice(0, 6).map((item) => ({
    ...item,
    name: CATEGORY_META[item.category].label,
    fill: CATEGORY_META[item.category].hex,
  }));

  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={slices}
            dataKey="amount"
            nameKey="name"
            innerRadius="64%"
            outerRadius="94%"
            paddingAngle={2}
            startAngle={90}
            endAngle={-270}
            stroke="none"
          >
            {slices.map((slice) => (
              <Cell key={slice.category} fill={slice.fill} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[11px] font-semibold text-ink-faint">This month</span>
        <span className="tnum text-xl font-extrabold text-ink">{formatCompactCurrency(total)}</span>
      </div>
    </div>
  );
}
