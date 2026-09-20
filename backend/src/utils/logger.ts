/**
 * Minimal structured logger.
 *
 * Deliberately avoids logging sensitive financial data (amounts, merchant
 * names) at info level. Only metadata such as the user id and error codes are
 * emitted, which keeps CloudWatch useful without leaking PII.
 */
type Level = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const CURRENT_LEVEL: Level = (process.env.LOG_LEVEL as Level) || 'info';

function shouldLog(level: Level): boolean {
    return LEVEL_ORDER[level] >= LEVEL_ORDER[CURRENT_LEVEL];
}

export interface LogContext {
    requestId?: string;
    userId?: string;
    [key: string]: unknown;
}

class Logger {
    private readonly context: LogContext;

    constructor(context: LogContext = {}) {
        this.context = context;
    }

    child(context: LogContext): Logger {
        return new Logger({ ...this.context, ...context });
    }

    private write(level: Level, message: string, meta?: LogContext): void {
        if (!shouldLog(level)) {
            return;
        }
        const entry = {
            level,
            message,
            timestamp: new Date().toISOString(),
            ...this.context,
            ...meta,
        };
        const line = JSON.stringify(entry);
        if (level === 'error') {
            console.error(line);
        } else if (level === 'warn') {
            console.warn(line);
        } else {
            console.log(line);
        }
    }

    debug(message: string, meta?: LogContext): void {
        this.write('debug', message, meta);
    }
    info(message: string, meta?: LogContext): void {
        this.write('info', message, meta);
    }
    warn(message: string, meta?: LogContext): void {
        this.write('warn', message, meta);
    }
    error(message: string, meta?: LogContext): void {
        this.write('error', message, meta);
    }
}

export const logger = new Logger();
export type { Logger };