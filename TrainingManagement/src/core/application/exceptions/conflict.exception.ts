import {
  ExceptionFilter,
  Catch,
  ConflictException,
  ArgumentsHost,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { apiExceptionConfig } from 'src/utils/api/apiExceptionConfig';
import { apiMethodsName, apiMethods } from 'src/utils/api/apiMethodsName';
import { LoggerService } from '../loggger/logger.service';
import { LoggerKafkaService } from '../loggger/loggerKafka.service';

@Catch(ConflictException)
export class ConflictExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {
    if (process.env.USE_KAFKA) {
      this.logger = new LoggerKafkaService();
    }
  }

  catch(exception: ConflictException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    // Tomamos el mensaje personalizado de la excepción o el mensaje por defecto
    const customMessage =
      exception.message || apiExceptionConfig.conflict.message;

    // Obtener el método HTTP y la configuración de la ruta
    const httpMethod = request.method;
    const routeConfig = this.getRouteConfig(httpMethod, request.url);
    const entity = routeConfig?.entity || this.getEntityFromMethod(httpMethod);

    // Estructura del log de error
    const errorLogs = this.createErrorLog(
      status,
      customMessage,
      httpMethod,
      entity,
    );

    // Log de error
    this.logger.error(JSON.stringify(errorLogs));

    // Responder al cliente con la estructura nueva
    response.status(status).json(errorLogs);
  }

  // Obtener la configuración de la ruta basada en el método HTTP y la URL
  private getRouteConfig(httpMethod: string, url: string) {
    const defaultRouteConfig = {
      entity: this.getEntityFromMethod(httpMethod), // Usar entidad predeterminada basada en el método HTTP
      method: httpMethod,
      path: url, // Ruta genérica por defecto
    };

    return (
      apiExceptionConfig.conflict.routes.find(
        (route) => route.method === httpMethod && url.startsWith(route.path),
      ) || defaultRouteConfig
    );
  }

  // Obtener la entidad basada en el método HTTP
  private getEntityFromMethod(httpMethod: string) {
    return apiMethodsName[
      httpMethod.toLowerCase() as keyof typeof apiMethodsName
    ];
  }

  // Crear los logs de error
  private createErrorLog(
    status: number,
    customMessage: string,
    httpMethod: string,
    entity: string,
  ) {
    return {
      code: apiExceptionConfig.conflict.code, // Código del error configurable
      message: customMessage, // Mensaje personalizado
      timestamp: new Date().toISOString(), // Timestamp actual
      service: apiMethods(httpMethod, entity), // Incluir el nombre del servicio basado en el método y la entidad
    };
  }
}
