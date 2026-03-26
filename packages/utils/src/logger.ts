type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
  service: string;
}

/**
 * Structured logger: JSON in production (for Datadog/CloudWatch ingestion),
 * human-readable in development.
 */
class Logger {
  constructor(private service = 'platform') {}

  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
      service: this.service,
    };

    const method = level === 'debug' ? 'log' : level;

    if (process.env.NODE_ENV === 'production') {
      console[method](JSON.stringify(entry));
    } else {
      console[method](`[${entry.timestamp}] [${level.toUpperCase()}] [${this.service}]`, message, context ?? '');
    }
  }

  debug(msg: string, ctx?: Record<string, unknown>) { this.log('debug', msg, ctx); }
  info(msg: string, ctx?: Record<string, unknown>) { this.log('info', msg, ctx); }
  warn(msg: string, ctx?: Record<string, unknown>) { this.log('warn', msg, ctx); }
  error(msg: string, ctx?: Record<string, unknown>) { this.log('error', msg, ctx); }

  child(service: string): Logger {
    return new Logger(`${this.service}:${service}`);
  }
}

export const logger = new Logger();
