import type * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Loader2, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { askSpendSense } from '@/services/api';
import { toUserMessage } from '@/services/errors';
import { MAX_QUESTION_LENGTH, MIN_QUESTION_LENGTH, SUGGESTED_QUESTIONS } from '@/constants';
import type { GeneratedBy } from '@/types';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  generatedBy?: GeneratedBy;
  evidence?: Record<string, unknown>;
  failed?: boolean;
}

export default function AskSpendSense() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState('');
  const [thinking, setThinking] = useState(false);
  const threadEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    threadEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, thinking]);

  const ask = async (text: string) => {
    const trimmed = text.trim();
    if (trimmed.length < MIN_QUESTION_LENGTH || thinking) return;

    setMessages((current) => [
      ...current,
      { id: `u-${Date.now()}`, role: 'user', text: trimmed },
    ]);
    setQuestion('');
    setThinking(true);

    try {
      const answer = await askSpendSense(trimmed);
      setMessages((current) => [
        ...current,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: answer.answer,
          generatedBy: answer.generatedBy,
          evidence: answer.evidence,
        },
      ]);
    } catch (cause) {
      setMessages((current) => [
        ...current,
        { id: `e-${Date.now()}`, role: 'assistant', text: toUserMessage(cause), failed: true },
      ]);
    } finally {
      setThinking(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void ask(question);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Ask SpendSense"
        description="Plain questions about your money, answered from your own history."
      />

      <Card className="flex min-h-[560px] flex-col lg:min-h-[620px]">
        <div className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center py-10 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary">
                <Sparkles className="h-5 w-5" aria-hidden />
              </span>
              <p className="mt-4 text-[17px] font-extrabold tracking-[-0.02em] text-ink">
                What would you like to know{user ? `, ${user.firstName}` : ''}?
              </p>
              <p className="mt-1.5 max-w-sm text-sm text-ink-muted">
                SpendSense reads your transactions and answers with the numbers behind it.
              </p>

              <ul className="mt-7 grid w-full max-w-lg gap-2.5 sm:grid-cols-2">
                {SUGGESTED_QUESTIONS.map((suggestion) => (
                  <li key={suggestion}>
                    <button
                      type="button"
                      onClick={() => void ask(suggestion)}
                      className="w-full rounded-xl border border-line bg-white px-4 py-3 text-left text-[13px] font-semibold text-ink-soft transition-colors hover:border-primary/40 hover:text-primary"
                    >
                      {suggestion}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {thinking && (
            <div className="flex items-center gap-2.5 text-[13px] text-ink-muted" role="status">
              <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden />
              Reading your transactions…
            </div>
          )}

          <div ref={threadEnd} />
        </div>

        <form onSubmit={handleSubmit} className="border-t border-line p-3.5 sm:p-4">
          <div className="flex items-end gap-2.5">
            <label htmlFor="question" className="sr-only">
              Ask a question about your spending
            </label>
            <textarea
              id="question"
              rows={1}
              value={question}
              maxLength={MAX_QUESTION_LENGTH}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  void ask(question);
                }
              }}
              placeholder="Ask about a category, a merchant, or last month…"
              className="field h-auto max-h-32 min-h-[46px] flex-1 resize-none py-3 leading-relaxed"
            />
            <button
              type="submit"
              disabled={question.trim().length < MIN_QUESTION_LENGTH || thinking}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white transition-colors hover:bg-primary-600 disabled:opacity-40"
              aria-label="Send question"
            >
              <ArrowUp className="h-[18px] w-[18px]" aria-hidden />
            </button>
          </div>
          <p className="mt-2 px-1 text-[11px] text-ink-faint">
            Answers use your recorded transactions only. Press Enter to send, Shift + Enter for a new line.
          </p>
        </form>
      </Card>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <p className="max-w-[80%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-[14px] leading-relaxed text-white">
          {message.text}
        </p>
      </div>
    );
  }

  const evidenceEntries = Object.entries(message.evidence ?? {}).filter(
    ([, value]) => value !== undefined && value !== null,
  );

  return (
    <div className="flex gap-3">
      <span
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary"
        aria-hidden
      >
        <Sparkles className="h-4 w-4" />
      </span>
      <Card
        className={cn(
          'max-w-[80%] rounded-2xl rounded-tl-md shadow-none',
          message.failed && 'border-danger/30 bg-red-50/50',
        )}
      >
        <CardContent className="p-4 sm:p-4">
          <p className="text-[14px] leading-relaxed text-ink-soft">{message.text}</p>

          {evidenceEntries.length > 0 && (
            <dl className="mt-3 flex flex-wrap gap-2">
              {evidenceEntries.map(([key, value]) => (
                <div
                  key={key}
                  className="rounded-lg bg-surface-sunken px-2.5 py-1.5 text-[11px] font-semibold text-ink-muted"
                >
                  <dt className="inline">{key}: </dt>
                  <dd className="tnum inline text-ink">{String(value)}</dd>
                </div>
              ))}
            </dl>
          )}

          {message.generatedBy && (
            <Badge tone={message.generatedBy === 'BEDROCK' ? 'primary' : 'neutral'} className="mt-3">
              {message.generatedBy === 'BEDROCK' ? 'AI generated' : 'Rule based'}
            </Badge>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
