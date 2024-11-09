import { ErrorDto } from 'src/core/application/dtos/error.dto';
import { apiBaseEntityName } from '../apiEntites';
import { apiMethodsName, setMethodsName } from '../apiMethodsName';
import { ResponseDto } from 'src/core/application/dtos/response.dto';

export const sendEntity = [
  {
    id: 'ID_CARD',
    name: 'ID Card',
  },
  {
    id: 'PASSPORT',
    name: 'Passport',
  },
];
export const createEntity = {
  status: 201,
  description: 'Success',
  example: [
    {
      id: 'ID_CARD',
      name: 'ID Card',
    },
  ],
};

export const apiStatus = {
  ok: {
    status: 200,
    description: 'Successful retrieval of identification types',
    type: ResponseDto,
    content: {
      'application/json': {
        example: sendEntity,
      },
    },
    example: sendEntity,
  },
  badRequest: {
    status: 400,
    description: 'Bad Request',
    type: ErrorDto,
    content: {
      'application/json': {
        example: {
          code: '400',
          message: 'Invalid parameters were provided',
          timestamp: new Date().toISOString(),
          service: setMethodsName('GET', apiBaseEntityName),
        },
      },
    },
    example: {
      code: '400',
      message: 'Invalid parameters were provided',
      timestamp: new Date().toISOString(),
      service: apiMethodsName.post,
    },
  },
  unauthorized: {
    status: 401,
    description: 'Authentication required',
    type: ErrorDto,
    content: {
      'application/json': {
        example: {
          code: '401',
          message: 'Authentication failed or not provided',
          timestamp: new Date().toISOString(),
          service: apiMethodsName.get,
        },
      },
    },
    example: {
      code: '401',
      message: 'Authentication failed or not provided',
      timestamp: new Date().toISOString(),
      service: apiMethodsName.get,
    },
  },
  forbidden: {
    status: 403,
    description: 'Access forbidden',
    type: ErrorDto,
    content: {
      'application/json': {
        example: {
          code: '403',
          message: 'You do not have permission to access this resource',
          timestamp: new Date().toISOString(),
          service: apiMethodsName.get,
        },
      },
    },
    example: {
      code: '403',
      message: 'You do not have permission to access this resource',
      timestamp: new Date().toISOString(),
      service: apiMethodsName.get,
    },
  },
  notFound: {
    status: 404,
    description: `${apiBaseEntityName} not found`,
    type: ErrorDto,
    content: {
      'application/json': {
        example: {
          code: '404',
          message: `${apiBaseEntityName} not found`,
          timestamp: new Date().toISOString(),
          service: apiMethodsName.get,
        },
      },
    },
    example: {
      code: '404',
      message: `${apiBaseEntityName} not found`,
      timestamp: new Date().toISOString(),
      service: apiMethodsName.get,
    },
  },
  methodNotserviceowed: {
    status: 405,
    description: `${apiBaseEntityName} method not serviceowed`,
    type: ErrorDto,
    content: {
      'application/json': {
        example: {
          code: '405',
          message: `${apiBaseEntityName} method not serviceowed`,
          timestamp: new Date().toISOString(),
          service: apiMethodsName.service,
        },
      },
    },
    example: {
      code: '405',
      message: `${apiBaseEntityName} method not serviceowed`,
      timestamp: new Date().toISOString(),
      service: apiMethodsName.service,
    },
  },
  requestTimeout: {
    status: 408,
    description: `Request timed out while waiting for ${apiBaseEntityName}`,
    type: ErrorDto,
    content: {
      'application/json': {
        example: {
          code: '408',
          message: `Request timed out while waiting for ${apiBaseEntityName}`,
          timestamp: new Date().toISOString(),
          service: apiMethodsName.service,
        },
      },
    },
    example: {
      code: '408',
      message: `Request timed out while waiting for ${apiBaseEntityName}`,
      timestamp: new Date().toISOString(),
      service: apiMethodsName.service,
    },
  },
  conflict: {
    status: 409,
    description: 'Conflict in the request',
    type: ErrorDto,
    content: {
      'application/json': {
        example: {
          code: '409',
          message: 'Business rule conflict occurred',
          timestamp: new Date().toISOString(),
          service: apiMethodsName.post,
        },
      },
    },
    example: {
      code: '409',
      message: 'Business rule conflict occurred',
      timestamp: new Date().toISOString(),
      service: apiMethodsName.post,
    },
  },
  internalServerError: {
    status: 500,
    description: 'Internal server error occurred while processing the request',
    type: ErrorDto,
    content: {
      'application/json': {
        example: {
          code: '500',
          message: 'An unexpected error occurred on the server',
          timestamp: new Date().toISOString(),
          service: apiMethodsName.get,
        },
      },
    },
    example: {
      code: '500',
      message: 'An unexpected error occurred on the server',
      timestamp: new Date().toISOString(),
      service: apiMethodsName.get,
    },
  },
  serviceUnavailable: {
    status: 503,
    description: `Service unavailable for ${apiBaseEntityName}`,
    type: ErrorDto,
    content: {
      'application/json': {
        example: {
          code: '503',
          message: `Service unavailable for ${apiBaseEntityName}`,
          timestamp: new Date().toISOString(),
          service: apiMethodsName.service,
        },
      },
    },
    example: {
      code: '503',
      message: `Service unavailable for ${apiBaseEntityName}`,
      timestamp: new Date().toISOString(),
      service: apiMethodsName.service,
    },
  },
};
