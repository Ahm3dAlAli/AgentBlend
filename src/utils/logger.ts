import winston from 'winston';

/**
 * Create a logger instance
 */
export function createLogger(options?: winston.LoggerOptions) {
  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    defaultMeta: { service: 'agentblend' },
    transports: [
      // Console transport
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      })
    ],
    ...options
  });
}

// Default logger instance
export const logger = createLogger();