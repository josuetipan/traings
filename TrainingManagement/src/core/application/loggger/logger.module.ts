import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerService } from './logger.service';
import { LoggerKafkaService } from './loggerKafka.service';

@Module({
  imports: [ConfigModule], // Importa ConfigModule
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {
  static register(useKafka: boolean): DynamicModule {
    const providers = [LoggerService];
    if (useKafka) {
      providers.push(LoggerKafkaService);
    }

    return {
      module: LoggerModule,
      providers,
      exports: providers,
    };
  }
}
