import { Link } from 'react-router-dom';
import { Plus, Receipt, Repeat2 } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { CardSkeleton, ErrorState, ListSkeleton } from '@/components/common/States';
import { SpendSummaryCard } from '@/components/dashboard/SpendSummaryCard';
import { StatTile } from '@/components/dashboard/StatTile';
import { MonthlyTrendCard } from '@/components/dashboard/MonthlyTrendCard';
import { CategoryBreakdownCard } from '@/components/dashboard/CategoryBreakdownCard';
import { RecentTransactionsCard } from '@/components/dashboard/RecentTransactionsCard';
import { TopMerchantsCard } from '@/components/dashboard/TopMerchantsCard';
import { InsightsPanel } from '@/components/insights/InsightsPanel';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useAuth } from '@/hooks/useAuth';
import { getDashboard } from '@/services/api';
import type { DashboardData } from '@/types';
import { formatCurrency, formatMonthKey, greeting } from '@/utils/format';

export default function Dashboard() {
  const { user } = useAuth();
  const { data, loading, error, refresh } = useAsyncData<DashboardData>(() => getDashboard());

  const daysElapsed = new Date().getDate();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting()}, ${user?.firstName ?? 'there'}`}
        description={
          data
            ? `Here is how your money looks today · ${formatMonthKey(data.month)}`
            : 'Here is how your money looks today'
        }
        actions={
          <Button asChild>
            <Link to="/app/payment">
              <Plus className="h-4 w-4" aria-hidden />
              New payment
            </Link>
          </Button>
        }
      />

      {error && !data && <ErrorState message={error} onRetry={refresh} className="card-surface" />}

      {loading && !data && (
        <>
          <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr_1fr]">
            <Skeleton className="h-[212px] rounded-2xl" />
            <CardSkeleton lines={1} />
            <CardSkeleton lines={1} />
          </div>
          <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
            <CardSkeleton lines={6} />
            <CardSkeleton lines={6} />
          </div>
          <Card className="overflow-hidden">
            <ListSkeleton />
          </Card>
        </>
      )}

      {data && (
        <>
          <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr_1fr]">
            <SpendSummaryCard
              month={data.month}
              totalSpent={data.totalSpent}
              change={data.monthOverMonthChange}
              changePercentage={data.monthOverMonthChangePercentage}
              transactionCount={data.transactionCount}
            />
            <StatTile
              label="Payments"
              value={String(data.transactionCount)}
              hint={`About ${formatCurrency(data.totalSpent / Math.max(daysElapsed, 1), { decimals: false })} a day so far`}
              icon={Receipt}
              progress={Math.min((daysElapsed / 30) * 100, 100)}
            />
            <StatTile
              label="Recurring"
              value={formatCurrency(data.estimatedMonthlyRecurring, { decimals: false })}
              hint={`${data.recurringPayments.length} repeating charges detected`}
              icon={Repeat2}
              iconClassName="bg-violet-50 text-violet-600"
              progress={
                data.totalSpent > 0
                  ? Math.min((data.estimatedMonthlyRecurring / data.totalSpent) * 100, 100)
                  : 0
              }
              progressClassName="bg-violet-500"
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
            <MonthlyTrendCard
              monthly={data.monthlySpend}
              daily={data.dailySpend}
              activeMonth={data.month}
            />
            <CategoryBreakdownCard data={data.categoryBreakdown} total={data.totalSpent} />
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
            <RecentTransactionsCard transactions={data.recentTransactions} />
            <div className="space-y-5">
              <InsightsPanel insights={data.insights} generatedBy={data.insightsGeneratedBy} limit={3} />
              <TopMerchantsCard merchants={data.topMerchants} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
