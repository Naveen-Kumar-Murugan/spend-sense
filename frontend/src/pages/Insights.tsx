import { Link } from 'react-router-dom';
import { MessageSquareText, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { CardSkeleton, ErrorState } from '@/components/common/States';
import { InsightCard } from '@/components/insights/InsightCard';
import { RecurringPaymentsCard } from '@/components/insights/RecurringPaymentsCard';
import { CategoryChangeCard } from '@/components/insights/CategoryChangeCard';
import { UnusualSpendCard } from '@/components/insights/UnusualSpendCard';
import { MonthlySpendChart } from '@/components/charts/MonthlySpendChart';
import { DailySpendChart } from '@/components/charts/DailySpendChart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAsyncData } from '@/hooks/useAsyncData';
import { getDashboard, getTransactions, getUnusualSpends } from '@/services/api';
import { buildCategoryChanges, previousMonthKey } from '@/utils/analytics';
import { formatCurrency, formatMonthKey } from '@/utils/format';
import type { DashboardData, Transaction } from '@/types';

interface InsightsBundle {
  dashboard: DashboardData;
  unusual: Transaction[];
  changes: ReturnType<typeof buildCategoryChanges>;
}

async function loadInsights(): Promise<InsightsBundle> {
  const dashboard = await getDashboard();
  const previous = previousMonthKey(dashboard.month);
  const [unusual, currentTxns, previousTxns] = await Promise.all([
    getUnusualSpends(dashboard.month),
    getTransactions({ month: dashboard.month, limit: 200 }),
    getTransactions({ month: previous, limit: 200 }),
  ]);

  return {
    dashboard,
    unusual,
    changes: buildCategoryChanges(currentTxns, previousTxns).slice(0, 5),
  };
}

export default function Insights() {
  const { data, loading, error, refresh } = useAsyncData<InsightsBundle>(loadInsights);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Insights"
        description="Patterns SpendSense found in your spending this month."
        actions={
          <>
            <Button variant="secondary" onClick={refresh} disabled={loading}>
              <RefreshCw className="h-4 w-4" aria-hidden />
              Refresh
            </Button>
            <Button asChild>
              <Link to="/app/ask">
                <MessageSquareText className="h-4 w-4" aria-hidden />
                Ask a question
              </Link>
            </Button>
          </>
        }
      />

      {loading && !data && (
        <div className="grid gap-5 lg:grid-cols-2">
          <CardSkeleton lines={4} />
          <CardSkeleton lines={4} />
          <CardSkeleton lines={5} />
          <CardSkeleton lines={5} />
        </div>
      )}

      {!loading && error && !data && <ErrorState message={error} onRetry={refresh} className="card-surface" />}

      {data && (
        <>
          <section aria-label="Highlights" className="grid gap-4 sm:grid-cols-2">
            {data.dashboard.insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </section>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Six-month trend</CardTitle>
                <CardDescription>
                  {formatMonthKey(data.dashboard.month)} is{' '}
                  {formatCurrency(Math.abs(data.dashboard.monthOverMonthChange), { decimals: false })}{' '}
                  {data.dashboard.monthOverMonthChange >= 0 ? 'above' : 'below'} last month
                </CardDescription>
              </div>
              <Badge tone={data.dashboard.monthOverMonthChange >= 0 ? 'danger' : 'mint'}>
                {data.dashboard.monthOverMonthChangePercentage}%
              </Badge>
            </CardHeader>
            <CardContent>
              <MonthlySpendChart
                data={data.dashboard.monthlySpend}
                activeMonth={data.dashboard.month}
                height={240}
              />
            </CardContent>
          </Card>

          <div className="grid gap-5 lg:grid-cols-2">
            <CategoryChangeCard changes={data.changes} />
            <RecurringPaymentsCard
              recurring={data.dashboard.recurringPayments}
              estimatedMonthly={data.dashboard.estimatedMonthlyRecurring}
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <UnusualSpendCard transactions={data.unusual} />
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Daily rhythm</CardTitle>
                  <CardDescription>How this month has played out day by day</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <DailySpendChart data={data.dashboard.dailySpend} height={236} />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
