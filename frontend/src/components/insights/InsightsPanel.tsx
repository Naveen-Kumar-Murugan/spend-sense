import { Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/common/States';
import type { GeneratedBy, Insight } from '@/types';
import { InsightCard } from './InsightCard';

interface Props {
  insights: Insight[];
  generatedBy: GeneratedBy;
  limit?: number;
}

export function InsightsPanel({ insights, generatedBy, limit = 4 }: Props) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" aria-hidden />
          <CardTitle>What SpendSense noticed</CardTitle>
        </div>
        <Badge tone={generatedBy === 'BEDROCK' ? 'primary' : 'neutral'}>
          {generatedBy === 'BEDROCK' ? 'AI generated' : 'Rule based'}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.length === 0 ? (
          <EmptyState
            title="Not enough history yet"
            description="Record a few payments and SpendSense will start spotting patterns."
          />
        ) : (
          insights.slice(0, limit).map((insight) => (
            <InsightCard key={insight.id} insight={insight} compact className="bg-surface-sunken/60" />
          ))
        )}
      </CardContent>
    </Card>
  );
}
