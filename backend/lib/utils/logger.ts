/**
 * Logging utility for consistent application logging
 * Supports different log levels and formatting
 */

type LogLevel = "debug" | "info" | "warn" | "error";

/**
 * Get the current log level from environment
 */
function getLogLevel(): LogLevel {
  return (process.env.LOG_LEVEL as LogLevel) || "info";
}

/**
 * Check if a log level should be output
 */
function shouldLog(level: LogLevel): boolean {
  const levels: LogLevel[] = ["debug", "info", "warn", "error"];
  const currentLevel = getLogLevel();
  return levels.indexOf(level) >= levels.indexOf(currentLevel);
}

/**
 * Format log message with timestamp
 */
function formatMessage(level: LogLevel, message: string, meta?: any): string {
  const timestamp = new Date().toISOString();
  const metaString = meta ? ` ${JSON.stringify(meta)}` : "";
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaString}`;
}

/**
 * Log a debug message
 */
export function debug(message: string, meta?: any): void {
  if (shouldLog("debug")) {
    console.log(formatMessage("debug", message, meta));
  }
}

/**
 * Log an info message
 */
export function info(message: string, meta?: any): void {
  if (shouldLog("info")) {
    console.log(formatMessage("info", message, meta));
  }
}

/**
 * Log a warning message
 */
export function warn(message: string, meta?: any): void {
  if (shouldLog("warn")) {
    console.warn(formatMessage("warn", message, meta));
  }
}

/**
 * Log an error message
 */
export function error(message: string, meta?: any): void {
  if (shouldLog("error")) {
    console.error(formatMessage("error", message, meta));
  }
}

/**
 * Create a logger instance with a context
 */
export function createLogger(context: string) {
  return {
    debug: (message: string, meta?: any) => debug(`[${context}] ${message}`, meta),
    info: (message: string, meta?: any) => info(`[${context}] ${message}`, meta),
    warn: (message: string, meta?: any) => warn(`[${context}] ${message}`, meta),
    error: (message: string, meta?: any) => error(`[${context}] ${message}`, meta),
  };
}

export const logger = {
  debug,
  info,
  warn,
  error,
  createLogger,
};
