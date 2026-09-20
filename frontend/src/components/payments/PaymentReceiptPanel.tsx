import type * as React from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { CheckCircle2, Clock, Copy, ExternalLink, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CategoryIcon } from "@/components/common/CategoryIcon";
import { CATEGORY_META } from "@/constants/categories";
import type { PaymentReceipt } from "@/types";
import { formatCurrency, titleCase } from "@/utils/format";

interface Props {
  receipt: PaymentReceipt;
  confirming: boolean;
  onOpenUpiApp: () => void;
  onConfirmUpi: () => void;
  onNewPayment: () => void;
}

export function PaymentReceiptPanel({
  receipt,
  confirming,
  onOpenUpiApp,
  onConfirmUpi,
  onNewPayment,
}: Props) {
  const pending = receipt.status === "PENDING";

  return (
    <div className="animate-fade-up rounded-2xl border border-line bg-white p-6 text-center shadow-card sm:p-8">
      <span
        className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${
          pending ? "bg-amber-50 text-warn" : "bg-mint-soft text-mint-dark"
        }`}
        aria-hidden
      >
        {pending ? (
          <Clock className="h-7 w-7" />
        ) : (
          <CheckCircle2 className="h-7 w-7" />
        )}
      </span>

      <h2 className="mt-5 text-xl font-extrabold tracking-[-0.02em] text-ink">
        {pending ? "Waiting on your UPI app" : "Payment recorded"}
      </h2>
      <p className="mt-1.5 text-sm text-ink-muted">{receipt.message}</p>

      <p className="tnum mt-6 text-[34px] font-extrabold tracking-[-0.03em] text-ink">
        {formatCurrency(receipt.amount, { decimals: true })}
      </p>

      <div className="mt-5 space-y-3 rounded-2xl bg-surface-sunken/70 p-4 text-left">
        <Row label="Paid to" value={receipt.merchant} />
        {receipt.receiverUpiId && (
          <Row
            label="Receiver UPI ID"
            value={
              <span className="tnum text-xs">{receipt.receiverUpiId}</span>
            }
          />
        )}
        <Row
          label="Category"
          value={
            <span className="inline-flex items-center gap-2">
              <CategoryIcon category={receipt.category} size="sm" />
              {CATEGORY_META[receipt.category].label} ·{" "}
              {titleCase(receipt.subcategory)}
            </span>
          }
        />
        <Row label="Method" value={titleCase(receipt.paymentMethod)} />
        <Row
          label="Reference"
          value={<span className="tnum text-xs">{receipt.paymentId}</span>}
        />
        <Row
          label="Status"
          value={
            <Badge tone={pending ? "warn" : "mint"}>
              {pending ? "Pending confirmation" : "Paid"}
            </Badge>
          }
        />
      </div>

      {receipt.upiIntent && (
        <div className="mt-5 space-y-2.5">
          {/* The QR encodes the raw upi://pay intent, so any UPI app (GPay,
              PhonePe, Paytm, BHIM) can scan it — including from another
              device when the link cannot be opened on this one. */}
          <div className="mx-auto w-fit rounded-2xl border border-line bg-white p-3">
            <QRCodeSVG
              value={receipt.upiIntent.uri}
              size={148}
              level="M"
              marginSize={2}
              bgColor="#FFFFFF"
              fgColor="#0F172A"
              title="UPI payment QR code"
            />
            <p className="mt-2 text-[11px] text-ink-faint">
              Scan with any UPI app to pay
            </p>
          </div>
          <Button className="w-full" onClick={onOpenUpiApp}>
            <ExternalLink className="h-4 w-4" aria-hidden />
            Open UPI app
          </Button>
          <button
            type="button"
            onClick={() =>
              navigator.clipboard?.writeText(receipt.upiIntent?.uri ?? "")
            }
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-ink"
          >
            <Copy className="h-3.5 w-3.5" aria-hidden />
            Copy payment link
          </button>
          <Button
            variant="secondary"
            className="w-full"
            loading={confirming}
            onClick={onConfirmUpi}
          >
            I have paid — mark as complete
          </Button>
          <p className="text-xs text-ink-faint">
            SpendSense cannot read your UPI app, so confirm here once the
            payment goes through.
          </p>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
        <Button variant="secondary" className="flex-1" onClick={onNewPayment}>
          <Plus className="h-4 w-4" aria-hidden />
          Another payment
        </Button>
        <Button asChild variant="subtle" className="flex-1">
          <Link to={`/app/transactions/${receipt.paymentId}`}>
            View transaction
          </Link>
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 text-[13px]">
      <span className="text-ink-muted">{label}</span>
      <span className="text-right font-semibold text-ink">{value}</span>
    </div>
  );
}
