/**
 * Date helpers used by analytics and recurring-payment detection.
 *
 * All timestamps are stored as ISO-8601 UTC strings. Helpers work in UTC to
 * keep analytics deterministic regardless of the server's local timezone.
 */

export function nowIso(): string {
    return new Date().toISOString();
}

export function toDate(iso: string): Date {
    return new Date(iso);
}

/** Returns `YYYY-MM` for an ISO timestamp (UTC). */
export function monthKey(iso: string): string {
    return iso.slice(0, 7);
}

/** Returns `YYYY-MM-DD` for an ISO timestamp (UTC). */
export function dayKey(iso: string): string {
    return iso.slice(0, 10);
}

export function currentMonthKey(reference: Date = new Date()): string {
    return reference.toISOString().slice(0, 7);
}

/** Adds `months` (can be negative) to a `YYYY-MM` key. */
export function shiftMonth(key: string, months: number): string {
    const [year, month] = key.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1 + months, 1));
    return date.toISOString().slice(0, 7);
}

/** Number of whole days between two ISO timestamps. */
export function daysBetween(aIso: string, bIso: string): number {
    const a = new Date(aIso).getTime();
    const b = new Date(bIso).getTime();
    return Math.abs(a - b) / (1000 * 60 * 60 * 24);
}

/** Inclusive list of the last `count` month keys, oldest first. */
export function lastNMonthKeys(count: number, reference: Date = new Date()): string[] {
    const current = currentMonthKey(reference);
    const keys: string[] = [];
    for (let i = count - 1; i >= 0; i -= 1) {
        keys.push(shiftMonth(current, -i));
    }
    return keys;
}

/** Human month label, e.g. `September 2026`. */
export function monthLabel(monthKeyValue: string): string {
    const [year, month] = monthKeyValue.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, 1));
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

/** Short label, e.g. `Sep 18`. */
export function shortDayLabel(iso: string): string {
    const date = new Date(iso);
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}