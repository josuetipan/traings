import { Injectable } from '@nestjs/common';
import { KafkaLogger } from 'kafka-logger-mm'; // Librería de Kafka
import { LoggerService } from './logger.service';
import { messageCustom } from 'src/utils/api/apiKafkaLogConfig';
import { apiBaseEntityName } from 'src/utils/api/apiEntites';

@Injectable()
export class LoggerKafkaService extends LoggerService {
  private kafkaLogger: KafkaLogger;

  constructor() {
    super();
    const brokers = process.env.KAFKA_BROKERS?.split(',') || ['0.0.0.0:9092'];
    const topic = process.env.KAFKA_TOPIC || 'example';

    this.kafkaLogger = new KafkaLogger(brokers, topic);
    this.kafkaLogger.connect();
  }

  async log(
    message: string,
    method: string = 'GET',
    entity: string = apiBaseEntityName,
  ) {
    const mensaje = messageCustom(message, method, entity, 'INFO');
    super.log(message);
    await this.kafkaLogger.logCustomMessage('INFO', mensaje);
  }

  async error(
    message: string,
    method: string = 'GET',
    entity: string = apiBaseEntityName,
  ) {
    const mensaje = messageCustom(message, method, entity, 'ERROR');
    super.error(message);
    await this.kafkaLogger.logCustomMessage('ERROR', mensaje);
  }

  async warn(message: string, method?: string, entity?: string) {
    const mensaje = messageCustom(message, method, entity, 'WARN');
    await this.kafkaLogger.logCustomMessage('WARN', mensaje);
  }

  async debug(message: string, method?: string, entity?: string) {
    const mensaje = messageCustom(message, method, entity, 'DEBUG');
    await this.kafkaLogger.logCustomMessage('DEBUG', mensaje);
  }

  async verbose(message: string, method?: string, entity?: string) {
    const mensaje = messageCustom(message, method, entity, 'VERBOSE');
    await this.kafkaLogger.logCustomMessage('VERBOSE', mensaje);
  }

  // Función auxiliar para formatear el mensaje
  private messageFormat(message: string, level: string): string {
    const date = new Date().toISOString();
    return `${date} - [${level.toUpperCase()}] ${message}`;
  }
}
