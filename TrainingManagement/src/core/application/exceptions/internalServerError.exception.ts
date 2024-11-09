import {
  ExceptionFilter,
  Catch,
  InternalServerErrorException,
  ArgumentsHost,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { apiExceptionConfig } from 'src/utils/api/apiExceptionConfig'; // Asegúrate de que la ruta sea correcta
import { apiMethodsName, apiMethods } from 'src/utils/api/apiMethodsName';
import { LoggerService } from '../loggger/logger.service';
import { LoggerKafkaService } from '../loggger/loggerKafka.service';

@Catch(InternalServerErrorException)
export class InternalServerErrorExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {
    if (process.env.USE_KAFKA) {
      this.logger = new LoggerKafkaService();
    }
  }

  catch(exception: InternalServerErrorException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const httpMethod = request.method;

    // Obtener la configuración de la ruta o usar la entidad predeterminada
    const routeConfig = this.getRouteConfig(httpMethod, request.url);
    const entity = routeConfig.entity || this.getEntityFromMethod(httpMethod);

    // Crear los logs de error
    const errorLogs = this.createErrorLog(
      status,
      exception.message,
      httpMethod,
      entity,
    );

    // Log de error
    this.logger.error(JSON.stringify(errorLogs));

    // Responder al cliente con la estructura nueva
    response.status(status).json(errorLogs);
  }

  // Obtener la configuración de la ruta con una opción por defecto si no se encuentra coincidencia
  private getRouteConfig(httpMethod: string, url: string) {
    const defaultRouteConfig = {
      entity: this.getEntityFromMethod(httpMethod), // Usar getEntityFromMethod como valor por defecto
      method: httpMethod, // Usar el método HTTP actual
      path: url, // Ruta genérica
    };

    return (
      apiExceptionConfig.internalServerError?.routes.find(
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
    customMessage: string | undefined,
    httpMethod: string,
    entity: string,
  ) {
    return {
      code: apiExceptionConfig.internalServerError.code, // Código del error configurable
      message: customMessage || apiExceptionConfig.internalServerError.message, // Mensaje personalizado o predeterminado
      timestamp: new Date().toISOString(), // Timestamp actual
      service: apiMethods(httpMethod, entity), // Incluir el nombre del servicio
    };
  }
}
