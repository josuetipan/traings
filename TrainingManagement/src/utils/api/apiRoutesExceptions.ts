import { apiBaseEntityName, apiBaseEntityName2 } from './apiEntites';

export const routesExceptions = {
  notFound: [
    {
      method: 'get',
      path: '/msa/users/1.0',
      entity: apiBaseEntityName,
    },
    {
      method: 'get',
      path: '/msa/users/2.0',
      entity: apiBaseEntityName2,
    },
  ],
  badRequest: [],
  forbidden: [],
  unauthorized: [], // Arreglo vacío para Unauthorized
  serviceUnavailable: [], // Arreglo vacío para Service Unavailable
  conflict: [], // Arreglo vacío para Conflict
  internalServerError: [], // Arreglo vacío para Internal Server Error
  methodNotAllowed: [],
  // Agrega más estados según sea necesario
};
