import { Link } from 'react-router-dom';
import { ArrowDownRight, ArrowUpRight, MessageSquareText, Send } from 'lucide-react';
import { formatCurrency, formatMonthKey, formatSignedPercent } from '@/utils/format';

interface Props {
  month: string;
  totalSpent: number;
  change: number;
  changePercentage: number;
  transactionCount: number;
}

export function SpendSummaryCard({ month, totalSpent, change, changePercentage, transactionCount }: Props) {
  const up = change >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  const [whole, fraction = '00'] = formatCurrency(totalSpent, { decimals: true }).replace('₹', '').split('.');

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-mint to-mint-dark p-6 text-white shadow-lift sm:p-7">
      <div className="absolute -right-10 -top-16 h-52 w-52 rounded-full bg-white/10" aria-hidden />
      <div className="relative">
        <p className="text-[13px] font-semibold text-white/85">Spent in {formatMonthKey(month)}</p>
        <p className="mt-2 flex items-baseline tracking-[-0.03em]">
          <span className="tnum text-[38px] font-extrabold leading-none sm:text-[44px]">₹{whole}</span>
          <span className="tnum text-xl font-bold text-white/70">.{fraction.slice(0, 2)}</span>
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold">
            <Icon className="h-3.5 w-3.5" aria-hidden />
            <span className="tnum">
              {formatCurrency(Math.abs(change), { decimals: false })} · {formatSignedPercent(changePercentage)}
            </span>
          </span>
          <span className="text-xs text-white/80">vs last month · {transactionCount} payments</span>
        </div>

        <div className="mt-6 flex gap-2.5">
          <Link
            to="/app/payment"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-[13px] font-bold text-mint-dark transition-transform hover:bg-white/90 active:scale-[.98]"
          >
            <Send className="h-4 w-4" aria-hidden />
            Make a payment
          </Link>
          <Link
            to="/app/ask"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-white/15 px-4 text-[13px] font-bold text-white transition-colors hover:bg-white/25"
          >
            <MessageSquareText className="h-4 w-4" aria-hidden />
            Ask SpendSense
          </Link>
        </div>
      </div>
    </section>
  );
}
