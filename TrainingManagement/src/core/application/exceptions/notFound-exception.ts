import {
  ExceptionFilter,
  Catch,
  NotFoundException,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { apiExceptionConfig } from 'src/utils/api/apiExceptionConfig';
import { Validator } from 'src/utils/api/apiValidations';
import { apiBaseEntityName } from 'src/utils/api/apiEntites';
import { apiMethodsName } from 'src/utils/api/apiMethodsName';
import { LoggerService } from '../loggger/logger.service';
import { LoggerKafkaService } from '../loggger/loggerKafka.service';

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {
    if (process.env.USE_KAFKA) {
      this.logger = new LoggerKafkaService();
    }
  }

  catch(exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const httpMethod = request.method;
    const exceptionResponse: any = exception.getResponse();
    let customMessage = exceptionResponse.message;

    // Verificar si la excepción incluye un mensaje específico
    if (exception.message.includes('Cannot')) {
      customMessage = `The route '${request.url}' was not found. Please ensure that the URL is correct and that the resource exists. (Entity: ${apiBaseEntityName}, Method: ${httpMethod})`;
    }

    // Obtener la configuración de la ruta
    const routeConfig = this.getRouteConfig(httpMethod, request.url);
    const entity = routeConfig.entity || this.getEntityFromMethod(httpMethod);

    // Validar que la ID en la URL sea un UUID válido
    const idParam = request.params['id'];
    if (idParam && !Validator.isValidUUID(idParam)) {
      response.status(HttpStatus.BAD_REQUEST).json({
        code: apiExceptionConfig.badRequest.code,
        message: `The parameter "id" must be a valid UUID. Provided: "${idParam}"`,
        timestamp: new Date().toISOString(),
        service:
          apiMethodsName[
            httpMethod.toLowerCase() as keyof typeof apiMethodsName
          ],
      });
      return;
    }

    // Validar parámetros requeridos para la ruta
    if (routeConfig) {
      const validationConfig =
        apiExceptionConfig.validation.routes[httpMethod.toLowerCase()];
      if (validationConfig && validationConfig.path === routeConfig.path) {
        for (const param of validationConfig.requiredParams) {
          if (!request.params[param]) {
            response.status(parseInt(apiExceptionConfig.badRequest.code)).json({
              code: apiExceptionConfig.badRequest.code,
              message: `The parameter "${param}" is required for this route.`,
              timestamp: new Date().toISOString(),
              service:
                apiMethodsName[
                  httpMethod.toLowerCase() as keyof typeof apiMethodsName
                ],
            });
            return;
          }
        }
      }

      // Respuesta de error para el caso de Not Found
      response.status(parseInt(apiExceptionConfig.notFound.code)).json({
        code: apiExceptionConfig.notFound.code,
        message: customMessage,
        timestamp: new Date().toISOString(),
        service: entity, // Usar la entidad extraída de la configuración de ruta
      });
      return;
    }

    // Respuesta para el caso de Not Found genérico
    response.status(HttpStatus.NOT_FOUND).json({
      code: apiExceptionConfig.notFound.code,
      message: customMessage,
      timestamp: new Date().toISOString(),
      service: entity, // Usar la entidad extraída de la configuración de ruta
    });

    // Log de error para registrar detalles sobre la excepción
    const errorLogs = JSON.stringify({
      code: apiExceptionConfig.notFound.code,
      message: customMessage,
      timestamp: new Date().toISOString(),
      service: entity,
    });
    this.logger.error(errorLogs); // Registro del error utilizando el servicio de logger
  }

  // Obtener la configuración de la ruta con una opción por defecto si no se encuentra coincidencia
  private getRouteConfig(httpMethod: string, url: string) {
    const defaultRouteConfig = {
      entity: this.getEntityFromMethod(httpMethod), // Usar getEntityFromMethod como valor por defecto
      method: httpMethod,
      path: url,
    };

    return (
      apiExceptionConfig.notFound.routes.find(
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
}
