import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { LoggerService } from '../loggger/logger.service';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    // Determina el código de estado

    const status = exception.getStatus();
    let errorResponse;

    // Maneja el caso específico de ConflictException sin relanzarla
    if (exception instanceof ConflictException) {
      errorResponse = {
        code: status,
        message: exception.message,
        timestamp: new Date().toISOString(),
        path: request.originalUrl,
        method: request.method,
      };
      // Log del error de conflicto
      this.logger.error(`Conflict Error: ${JSON.stringify(errorResponse)}`);
      return response.status(HttpStatus.CONFLICT).json(errorResponse);
    }

    // Maneja otros errores de HttpException como 401, 403, etc.
    if (status === HttpStatus.FORBIDDEN || status === HttpStatus.UNAUTHORIZED) {
      errorResponse = {
        code: status,
        message: exception.message,
        timestamp: new Date().toISOString(),
        path: request.originalUrl,
        method: request.method,
      };
      this.logger.error(
        `Authorization Error: ${JSON.stringify(errorResponse)}`,
      );
      return response.status(status).json(errorResponse);
    }

    // Para errores no HTTP
    errorResponse = {
      code: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal Server Error',
      timestamp: new Date().toISOString(),
      path: request.originalUrl,
      method: request.method,
    };

    // Log del error inesperado
    this.logger.error(`Unexpected Error: ${JSON.stringify(errorResponse)}`);
    return response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}
