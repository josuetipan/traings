import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaClientInitializationError } from '@prisma/client/runtime/library';
import { LoggerKafkaService } from '../loggger/loggerKafka.service';
import { LoggerService } from '../loggger/logger.service';

@Injectable()
export class PrismaService extends PrismaClient {
  private readonly logger =
    process.env.USE_KAFKA == 'true'
      ? new LoggerKafkaService()
      : new LoggerService();
  private readonly retryDelay = 5000; // Intentar reconectar cada 5 segundos
  public isConnected = false; // Variable para almacenar el estado de la conexión

  async onModuleInit() {
    await this.connectToDatabase();
  }

  private async connectToDatabase() {
    try {
      await this.$connect();
      this.isConnected = true;
      this.logger.log('Connected to the database');
    } catch (error) {
      this.isConnected = false;
      if (error instanceof PrismaClientInitializationError) {
        this.logger.error(
          'Failed to connect to the database. Retrying in 5 seconds...',
        );
        this.logger.error(error.message);
      } else {
        this.logger.error('Unexpected error during Prisma initialization');
        this.logger.error(error);
      }
      // Espera 5 segundos y vuelve a intentar
      setTimeout(() => this.connectToDatabase(), this.retryDelay);
    }
  }
}
