import { apiBaseEntityName } from './apiEntites';
import { apiMethodsName, setMethodsName } from './apiMethodsName';
import { routesExceptions } from './apiRoutesExceptions';

//Para usarlo en el swagger

export const apiExceptionConfig = {
  notFound: {
    code: '404',
    message: `${apiBaseEntityName} not found`,
    timestamp: new Date().toISOString(),
    service: apiMethodsName.get,
    example: {
      code: 'Not Found',
      message: `${apiBaseEntityName} not found`,
      timestamp: new Date().toISOString(),
      service: setMethodsName('GET', apiBaseEntityName),
    },
    routes: routesExceptions.notFound,
  },
  badRequest: {
    code: '400',
    message: 'Bad request due to invalid syntax or parameters',
    timestamp: new Date().toISOString(),
    service: 'User Service',
    example: {
      code: 'Bad Request',
      message: 'Invalid parameters were provided',
      timestamp: new Date().toISOString(),
      service: 'User Service',
    },
    routes: routesExceptions.badRequest,
  },
  methodNotAllowed: {
    code: 'Method Not Allowed',
    message: 'Method Not Allowed',
    timestamp: new Date().toISOString(),
    service: 'User Service',
    example: {
      code: 'Method Not Allowed',
      message: 'The method is not allowed for this endpoint',
      timestamp: new Date().toISOString(),
      service: 'User Service',
    },
    routes: routesExceptions.methodNotAllowed ?? [],
  },
  unauthorized: {
    code: 'Unauthorized',
    message: 'Authentication is required and has failed or not been provided',
    timestamp: new Date().toISOString(),
    service: 'User Service',
    example: {
      code: 'Unauthorized',
      message: 'Authentication failed or not provided',
      timestamp: new Date().toISOString(),
      service: 'User Service',
    },
    routes: routesExceptions.unauthorized ?? [],
  },
  forbidden: {
    code: 'Forbidden',
    message: 'Access to the resource is forbidden',
    timestamp: new Date().toISOString(),
    service: 'User Service',
    example: {
      code: 'Forbidden',
      message: 'You do not have permission to access this resource',
      timestamp: new Date().toISOString(),
      service: 'User Service',
    },
    routes: routesExceptions.forbidden ?? [],
  },
  conflict: {
    code: 'Conflicting',
    message: 'A conflict occurred due to duplicate data or conflicting state',
    timestamp: new Date().toISOString(),
    service: 'User Service',
    example: {
      code: 'Conflicting',
      message: 'Duplicate or conflicting data found',
      timestamp: new Date().toISOString(),
      service: 'User Service',
    },
    routes: routesExceptions.badRequest,
  },
  internalServerError: {
    code: 'Internal Server Error',
    message: 'Internal server error occurred while processing the request',
    timestamp: new Date().toISOString(),
    service: 'User Service',
    example: {
      code: 'Internal Server Error',
      message: 'An unexpected error occurred on the server',
      timestamp: new Date().toISOString(),
      service: 'User Service',
    },
    routes: routesExceptions.internalServerError,
  },
  serviceUnavailable: {
    code: 'Unavailable',
    message: 'Service is currently unavailable',
    timestamp: new Date().toISOString(),
    service: 'User Service',
    example: {
      code: 'Unavailable',
      message: 'The service is temporarily unavailable, please try again later',
      timestamp: new Date().toISOString(),
      service: 'User Service',
    },
    routes: routesExceptions.serviceUnavailable,
  },
  validation: {
    routes: {
      put: {
        path: '/msa/identificationtypes/1.0',
        requiredParams: ['id'],
      },
      delete: {
        path: '/msa/identificationtypes/1.0',
        requiredParams: ['id'],
      },
      // Agrega más métodos y rutas para validaciones aquí
    },
  },
  // Sección para agregar más configuraciones según sea necesario
};
