import { useState } from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { PaymentForm, type PaymentSubmitValues } from '@/components/payments/PaymentForm';
import { PaymentReceiptPanel } from '@/components/payments/PaymentReceiptPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';
import { confirmUpiPayment, openUpiApp, submitPayment } from '@/services/payments';
import { toUserMessage } from '@/services/errors';
import type { PaymentReceipt } from '@/types';
import { formatCurrency } from '@/utils/format';

export default function Payment() {
  const { notify } = useToast();
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: PaymentSubmitValues) => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await submitPayment(values);
      setReceipt(result);
      notify(
        result.status === 'PENDING'
          ? 'UPI request created. Confirm once you have paid.'
          : `${formatCurrency(result.amount, { decimals: false })} paid to ${result.merchant}.`,
      );
    } catch (cause) {
      const message = toUserMessage(cause);
      setError(message);
      notify(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmUpi = async () => {
    if (!receipt) return;
    setConfirming(true);
    try {
      const transaction = await confirmUpiPayment(receipt.paymentId);
      setReceipt({ ...receipt, status: transaction.status, message: 'Payment recorded successfully.', transaction });
      notify('Payment confirmed and added to your history.');
    } catch (cause) {
      notify(toUserMessage(cause), 'error');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Make a payment"
        description="Record a spend or send a UPI request — it lands in your history straight away."
      />

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <Card className="p-5 sm:p-7">
          {receipt ? (
            <PaymentReceiptPanel
              receipt={receipt}
              confirming={confirming}
              onOpenUpiApp={() => {
                if (receipt.upiIntent && !openUpiApp(receipt.upiIntent.uri)) {
                  notify('No UPI app could be opened on this device.', 'error');
                }
              }}
              onConfirmUpi={handleConfirmUpi}
              onNewPayment={() => {
                setReceipt(null);
                setError(null);
              }}
            />
          ) : (
            <PaymentForm submitting={submitting} error={error} onSubmit={handleSubmit} />
          )}
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
                <CardTitle>How payments work</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-[13px] leading-relaxed text-ink-muted">
              <p>
                <span className="font-semibold text-ink">Record it here</span> logs the payment
                immediately — useful for cash, cards and anything you have already paid.
              </p>
              <p>
                <span className="font-semibold text-ink">Open my UPI app</span> builds a{' '}
                <code className="rounded bg-surface-sunken px-1 py-0.5 text-[12px]">upi://</code> link and
                hands it to your payment app. SpendSense cannot read the result, so the payment stays
                pending until you confirm it.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-primary to-violet-600 text-white">
            <CardContent className="pt-5 sm:pt-6">
              <Sparkles className="h-5 w-5" aria-hidden />
              <p className="mt-3 text-[15px] font-bold leading-snug">Categorise as you go</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-white/85">
                Every payment you file correctly makes your insights sharper. You can always change a
                category later from the transaction page.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
