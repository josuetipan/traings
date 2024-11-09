import {
  ExceptionFilter,
  Catch,
  HttpException,
  ArgumentsHost,
  HttpStatus,
  BadRequestException,
  MethodNotAllowedException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { match } from 'path-to-regexp';
import { enablePathMethods } from 'src/utils/api/apiEnableMethods';
import { LoggerService } from '../loggger/logger.service';
import { ValidationError } from 'class-validator';
import { apiMethodsName, setMethodsName } from 'src/utils/api/apiMethodsName';
import { apiExceptionConfig } from 'src/utils/api/apiExceptionConfig';
import { LoggerKafkaService } from '../loggger/loggerKafka.service';

@Catch(MethodNotAllowedException)
export class MethodNotAllowedFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService | LoggerKafkaService) {
    if (process.env.USE_KAFKA) {
      this.logger = new LoggerKafkaService();
    }
  }
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const httpMethod = request.method.toLowerCase(); // Obtener el método HTTP
    const status = exception.getStatus();
    const path = request.originalUrl; // Obtener el path solicitado
    const routeConfig = this.getRouteConfig(httpMethod, request.originalUrl);
    const entity = routeConfig.entity || this.getEntityFromMethod(httpMethod);
    let customMessage =
      exception.message ||
      `An error occurred with the ${httpMethod.toUpperCase()} method for path: ${path}`;
    if (
      request.body == undefined &&
      (httpMethod == 'post' || httpMethod == 'put')
    ) {
      customMessage = 'Structure error';
    }
    if (
      Object.keys(request.body).length === 0 &&
      (httpMethod == 'post' || httpMethod == 'put')
    ) {
      customMessage = 'Structure error';
    }
    // Verificar si la ruta está definida en enablePathMethods para el método actual
    const isMethodAllowed = this.isMethodAllowed(httpMethod, path);
    const validationErrors = this.extractValidationErrors(exception);
    if (!isMethodAllowed) {
      // Verificar si la ruta existe para cualquier método
      const isRouteDefined = this.isRouteDefined(path);

      if (!isRouteDefined) {
        // Si la ruta no está definida en ningún método, devolver un 404
        return this.handleNotFound(response, path, entity, httpMethod);
      }

      // Si la ruta existe pero el método no está permitido, devolver un 405
      return this.handleMethodNotAllowed(response, path, entity, httpMethod);
    }
    let entityApi;
    if (routeConfig.entity) {
      entityApi = routeConfig.entity;
    } else {
      entityApi = entity;
    }
    // Si ocurre cualquier otra excepción, manejarla y enviar la respuesta
    const errorLogs = this.createErrorLog(
      exception,
      status,
      httpMethod,
      path,
      setMethodsName(httpMethod.toLowerCase(), entityApi),
      customMessage,
      validationErrors,
    );
    this.logger.error(JSON.stringify(errorLogs), httpMethod, entity);
    return response.status(status).json(errorLogs);
  }

  // Verificar si la ruta está definida para el método HTTP actual
  private isMethodAllowed(httpMethod: string, path: string): boolean {
    if (enablePathMethods[httpMethod]) {
      return enablePathMethods[httpMethod].some((allowedPath) => {
        const matcher = match(allowedPath, { decode: decodeURIComponent });
        return matcher(path);
      });
    }
    return false;
  }

  // Verificar si la ruta está definida en cualquier método
  private isRouteDefined(path: string): boolean {
    return Object.values(enablePathMethods).some((allowedPaths) =>
      allowedPaths.some((allowedPath) => {
        const matcher = match(allowedPath, { decode: decodeURIComponent });
        return matcher(path);
      }),
    );
  }

  // Manejar la respuesta para rutas no encontradas (404)
  private handleNotFound(
    response: Response,
    path: string,
    entity: string,
    httpMethod: string,
  ) {
    const errorResponse = {
      code: HttpStatus.NOT_FOUND,
      message: `Route ${path} not found :c`,
      timestamp: new Date().toISOString(),
      service:
        setMethodsName(httpMethod, entity) ??
        this.getEntityFromMethod(httpMethod),
    };
    this.logger.error(JSON.stringify(errorResponse), httpMethod, entity);
    response.status(HttpStatus.NOT_FOUND).json(errorResponse);
  }

  // Manejar la respuesta para métodos no permitidos (405)
  private async handleMethodNotAllowed(
    response: Response,
    path: string,
    entity: string,
    httpMethod: string,
  ) {
    const errorResponse = {
      code: HttpStatus.METHOD_NOT_ALLOWED,
      message: `Method not allowed for path: ${path}`,
      timestamp: new Date().toISOString(),
      service:
        setMethodsName(httpMethod, entity) ??
        this.getEntityFromMethod(httpMethod),
    };
    this.logger.error(JSON.stringify(errorResponse), httpMethod, entity);
    response.status(HttpStatus.METHOD_NOT_ALLOWED).json(errorResponse);
  }

  // Crear log de error para respuestas personalizadas
  private createErrorLog(
    exception: HttpException,
    status: number,
    httpMethod: string,
    path: string,
    method: string,
    message: string,
    groupedErrors: Record<string, string[]>,
  ) {
    let errors;
    if (Array.isArray(groupedErrors)) {
      errors = {
        code: status,
        message: message,
        timestamp: new Date().toISOString(),
        service: method,
        path,
        groupedErrors: groupedErrors,
      };
    } else {
      errors = {
        code: status,
        message: message,
        timestamp: new Date().toISOString(),
        service: method,
        path,
      };
    }
    return errors;
  }
  private extractValidationErrors(exception: BadRequestException) {
    const exceptionResponse: any = exception.getResponse();
    const validationErrors = exceptionResponse.message;
    let groupedErrors: Record<string, string[]> = {};
    if (Array.isArray(validationErrors)) {
      groupedErrors = validationErrors.reduce(
        (acc: Record<string, string[]>, error: ValidationError | string) => {
          if (typeof error === 'string') {
            acc.general = acc.general || [];
            acc.general.push(error);
          } else {
            const field = error.property;
            const messages = Object.values(error.constraints);
            acc[field] = acc[field] || [];
            acc[field].push(...messages);
          }
          return acc;
        },
        {},
      );
    }

    return groupedErrors;
  }
  private getEntityFromMethod(httpMethod: string) {
    return apiMethodsName[
      httpMethod.toLowerCase() as keyof typeof apiMethodsName
    ];
  }
  private getRouteConfig(httpMethod: string, url: string) {
    const defaultRouteConfig = {
      entity: this.getEntityFromMethod(httpMethod), // Usar getEntityFromMethod como valor por defecto
      method: httpMethod,
      path: url,
    };
    const cleanPath = (path: string) => path.replace(/\.$/, '');
    let configRoute = apiExceptionConfig.notFound.routes.find((route) => {
      const cleanedRoutePath = cleanPath(route.path);
      const cleanedUrl = cleanPath(url);
      if (!cleanedUrl.startsWith(cleanedRoutePath)) {
        const idsUrl = cleanedRoutePath.split(':')[0];
        return route.method === httpMethod && cleanedUrl.startsWith(idsUrl);
      }
      return (
        route.method === httpMethod && cleanedUrl.startsWith(cleanedRoutePath)
      );
    });
    if (configRoute === undefined) {
      configRoute = apiExceptionConfig.methodNotAllowed.routes.find((route) => {
        const cleanedRoutePath = cleanPath(route.path);
        const cleanedUrl = cleanPath(url);
        if (!cleanedUrl.startsWith(cleanedRoutePath)) {
          const idsUrl = cleanedRoutePath.split(':')[0];
          return cleanedUrl.startsWith(idsUrl);
        }
        return cleanedUrl.startsWith(cleanedRoutePath);
      });
      if (configRoute !== undefined && configRoute.method !== httpMethod) {
        configRoute.method = httpMethod;
      }
    }
    return configRoute || defaultRouteConfig;
  }
}
