import {
  Injectable,
  NestMiddleware,
  BadRequestException,
  MethodNotAllowedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { match } from 'path-to-regexp';
import { enablePathMethods } from 'src/utils/api/apiEnableMethods';

@Injectable()
export class PathMethodMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const method = req.method.toLowerCase(); // Obtener el método HTTP (get, post, etc.)
    const path = req.originalUrl; // Obtener el path solicitado

    // Verificar si la ruta existe en cualquier método
    const isRouteDefined = Object.values(enablePathMethods).some(
      (allowedPaths) =>
        allowedPaths.some((allowedPath) => {
          const matcher = match(allowedPath, { decode: decodeURIComponent });
          return matcher(path); // Verifica si la ruta coincide con cualquier ruta definida
        }),
    );
    if (!isRouteDefined) {
      // Si la ruta no está definida para ningún método, devolvemos un 404
      throw new BadRequestException(`Route ${path} not found`);
    }

    // Si la ruta está definida, verificamos si el método está permitido
    if (enablePathMethods[method]) {
      const isMethodAllowed = enablePathMethods[method].some((allowedPath) => {
        const matcher = match(allowedPath, { decode: decodeURIComponent });
        return matcher(path); // Verifica si la ruta es válida para el método actual
      });

      if (isMethodAllowed) {
        return next(); // Si el método está permitido para la ruta, continuamos
      }
    }

    // Si la ruta existe pero el método no está permitido, lanzamos una excepción 405
    throw new MethodNotAllowedException(
      `Method ${req.method} is not allowed for the path: ${path}`,
    );
  }
}
