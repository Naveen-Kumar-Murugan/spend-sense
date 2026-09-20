import { formatCurrency } from '@/utils/format';

interface TooltipEntry {
  dataKey?: string | number;
  value?: number | string;
  color?: string;
}

export interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
  labelFormatter?: (label: string) => string;
}

/** Shared tooltip for every Recharts surface in the app. */
export function ChartTooltip({ active, payload, label, labelFormatter }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-line bg-white px-3 py-2 shadow-lift">
      <p className="text-[11px] font-semibold text-ink-faint">
        {labelFormatter ? labelFormatter(String(label ?? '')) : String(label ?? '')}
      </p>
      {payload.map((entry, index) => (
        <p
          key={`${String(entry.dataKey)}-${index}`}
          className="mt-1 flex items-center gap-2 text-[13px] font-semibold text-ink"
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color ?? '#4F46E5' }}
            aria-hidden
          />
          <span className="tnum">{formatCurrency(Number(entry.value ?? 0), { decimals: false })}</span>
        </p>
      ))}
    </div>
  );
}
