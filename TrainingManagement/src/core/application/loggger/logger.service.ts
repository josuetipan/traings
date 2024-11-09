// logger.service.ts
import { Injectable } from '@nestjs/common';
import { Logger, createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';

@Injectable()
export class LoggerService {
  private loggerInfo: Logger;
  private loggerError: Logger;
  private loggerDebug: Logger;
  private loggerAll: Logger;

  constructor() {
    // Inicializamos el KafkaLogger con el broker y el tópico deseado
    this.createLoggers(); // Creamos los loggers de Winston
  }

  createLoggers() {
    const textFormat = format.combine(
      format.printf((log) => {
        return `${log.timestamp} - [${log.level.toUpperCase()}] ${log.message}`;
      }),
    );
    const dateFormat = format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    });

    // Logger para mensajes de info
    this.loggerInfo = createLogger({
      level: 'info',
      format: format.combine(dateFormat, textFormat),
      transports: [
        new transports.DailyRotateFile({
          filename: 'logs/info/info-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
        }),
      ],
    });

    // Logger para mensajes de error
    this.loggerError = createLogger({
      level: 'error',
      format: format.combine(dateFormat, textFormat),
      transports: [
        new transports.DailyRotateFile({
          filename: 'logs/error/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
        }),
      ],
    });

    // Logger loggerDebug mensajes de advertencia
    this.loggerDebug = createLogger({
      level: 'debug',
      format: format.combine(dateFormat, textFormat),
      transports: [
        new transports.DailyRotateFile({
          filename: 'logs/debug/debug-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
        }),
      ],
    });

    // Logger para todos los mensajes
    this.loggerAll = createLogger({
      format: format.combine(dateFormat, textFormat),
      transports: [
        new transports.DailyRotateFile({
          filename: 'logs/all/all-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
        }),
        new transports.Console(), // También imprimimos en consola
      ],
    });
  }
  async log(message: string) {
    const levelLogger = process.env.LOG_LEVEL ?? 'debug';
    if (levelLogger === 'info') {
      this.loggerInfo.info(message);
    }
    if (levelLogger === 'debug' || levelLogger === 'info') {
      this.loggerAll.info(message);
    }
  }

  async error(message: string) {
    const levelLogger = process.env.LOG_LEVEL ?? 'debug'; //error
    if (levelLogger === 'error') {
      this.loggerError.error(message);
    }
    this.loggerAll.error(message);
  }

  async debug(message: string) {
    const levelLogger = process.env.LOG_LEVEL ?? 'debug';
    if (levelLogger === 'debug') {
      this.loggerDebug.debug(message);
    }
    this.loggerAll.debug(message);
  }
  async warn(message: string) {
    this.loggerAll.warn(message);
  }
  async verbose(message: string) {
    this.loggerAll.verbose(message);
  }
}
