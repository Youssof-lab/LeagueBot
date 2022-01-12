/* eslint-disable no-param-reassign */
/* eslint-disable prefer-const */
/* eslint-disable no-shadow */
/* eslint-disable object-curly-newline */
const { createLogger, format, transports } = require("winston");

const { printf, combine, errors, timestamp, colorize } = format;
require("winston-daily-rotate-file");

const customFormat = printf((info) => {
  let { timestamp, level, stack, message } = info;
  message = stack || message;
  return `[${timestamp}] ${level} | ${message}`;
});

const logger = createLogger({
  level: "info",
  format: combine(
    format((info) => {
      info.level = info.level.toUpperCase();
      return info;
    })(),
    errors({ stack: true }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  ),
  transports: [
    new transports.Console({
      format: combine(colorize(), customFormat),
    }),
    new transports.DailyRotateFile({
      filename: "out-%DATE%.log",
      dirname: "./logs/",
      datePattern: "YYYY-MM-DD",
      json: false,
      format: customFormat,
    }),
    new transports.DailyRotateFile({
      level: "warn",
      filename: "err-%DATE%.log",
      dirname: "./logs/",
      datePattern: "YYYY-MM-DD",
      json: false,
      format: customFormat,
    }),
  ],
});

module.exports = logger;
