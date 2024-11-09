import {
  ExceptionFilter,
  Catch,
  UnauthorizedException,
  ArgumentsHost,
} from '@nestjs/common';
import { Response } from 'express';
import { apiExceptionConfig } from 'src/utils/api/apiExceptionConfig';
import { apiMethodsName } from 'src/utils/api/apiMethodsName';
import { LoggerService } from '../loggger/logger.service';
import { LoggerKafkaService } from '../loggger/loggerKafka.service';

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {
    if (process.env.USE_KAFKA) {
      this.logger = new LoggerKafkaService();
    }
  }

  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest(); // Obtener el objeto de solicitud
    const httpMethod = request.method; // Obtener el método HTTP

    const status = 401; // Código de estado 401 para Unauthorized

    // Mensaje personalizado
    const customMessage = this.getCustomMessage(httpMethod);
    const serviceName = this.getServiceName(httpMethod); // Llama a la función para obtener el nombre del servicio

    const errorLogs = {
      code: apiExceptionConfig.unauthorized.code, // Código del error configurable
      message: customMessage, // Mensaje personalizado
      timestamp: new Date().toISOString(), // Timestamp actual
      service: serviceName, // Nombre del servicio
    };

    // Log de error
    this.logger.error(JSON.stringify(errorLogs));

    // Responder al cliente con la estructura nueva
    response.status(status).json(errorLogs);
  }

  // Método para obtener un mensaje personalizado según el método HTTP
  private getCustomMessage(httpMethod: string): string {
    switch (httpMethod) {
      case 'GET':
        return 'Unauthorized access for GET requests. Please authenticate.';
      case 'POST':
        return 'Unauthorized access for POST requests. Please authenticate.';
      case 'PUT':
        return 'Unauthorized access for PUT requests. Please authenticate.';
      case 'DELETE':
        return 'Unauthorized access for DELETE requests. Please authenticate.';
      default:
        return apiExceptionConfig.unauthorized.message; // Mensaje por defecto
    }
  }

  // Método para obtener el nombre del servicio basado en el método HTTP
  private getServiceName(httpMethod: string): string {
    const method = httpMethod.toLowerCase(); // Convierte el método a minúsculas
    return (
      apiMethodsName[method as keyof typeof apiMethodsName] || 'unknownService'
    );
  }
}
