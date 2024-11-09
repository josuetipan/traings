import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerService } from './core/application/loggger/logger.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { appConfig } from './utils/config/app.config';
import { BadRequestExceptionFilter } from './core/application/exceptions/badRequest.exception';
import { MethodNotAllowedFilter } from './core/application/exceptions/methodNotAllow-exception';
import { NotFoundExceptionFilter } from './core/application/exceptions/notFound-exception';
import { ConflictExceptionFilter } from './core/application/exceptions/conflict.exception';
import { ForbiddenExceptionFilter } from './core/application/exceptions/forbidden.exception';
import { InternalServerErrorExceptionFilter } from './core/application/exceptions/internalServerError.exception';
import { ServiceUnavailableExceptionFilter } from './core/application/exceptions/serviceUnavailable.exception';
import { UnauthorizedExceptionFilter } from './core/application/exceptions/unauthorized.exception';
import { LoggerKafkaService } from './core/application/loggger/loggerKafka.service';
import { HttpExceptionFilter } from './core/application/exceptions/httpException.exception';
async function bootstrap() {
  //Establecer logger e inicializar NEST
  const logger =
    process.env.USE_KAFKA == 'true'
      ? new LoggerKafkaService()
      : new LoggerService();
  const app = await NestFactory.create(AppModule, {
    logger: logger,
  });
  const loggerService = new LoggerService();
  // Validaciones
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new BadRequestExceptionFilter(loggerService),
    new NotFoundExceptionFilter(loggerService),
    new ConflictExceptionFilter(loggerService),
    new ForbiddenExceptionFilter(loggerService),
    new InternalServerErrorExceptionFilter(loggerService),
    new ServiceUnavailableExceptionFilter(loggerService),
    new UnauthorizedExceptionFilter(loggerService),
    new MethodNotAllowedFilter(loggerService),
  );
  //Levantar Microservicio
  await app.listen(appConfig.port);
  logger.log(
    `🚀 Microservice started on port ${appConfig.port} in ${appConfig.mode.toUpperCase()} mode`,
  );
}
bootstrap();
