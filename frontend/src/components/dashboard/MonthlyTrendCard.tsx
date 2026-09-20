import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MonthlySpendChart } from '@/components/charts/MonthlySpendChart';
import { DailySpendChart } from '@/components/charts/DailySpendChart';
import type { DailySpend, MonthlySpend } from '@/types';

interface Props {
  monthly: MonthlySpend[];
  daily: DailySpend[];
  activeMonth: string;
}

export function MonthlyTrendCard({ monthly, daily, activeMonth }: Props) {
  const [view, setView] = useState<'monthly' | 'daily'>('monthly');

  return (
    <Card>
      <CardHeader className="flex-col items-start gap-4 sm:flex-row sm:items-center">
        <div>
          <CardTitle>Spending trend</CardTitle>
          <CardDescription>
            {view === 'monthly' ? 'Last 6 months' : 'Day by day this month'}
          </CardDescription>
        </div>
        <Tabs value={view} onValueChange={(value) => setView(value as 'monthly' | 'daily')}>
          <TabsList>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="daily">Daily</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {view === 'monthly' ? (
          <MonthlySpendChart data={monthly} activeMonth={activeMonth} />
        ) : (
          <DailySpendChart data={daily} height={260} />
        )}
      </CardContent>
    </Card>
  );
}
