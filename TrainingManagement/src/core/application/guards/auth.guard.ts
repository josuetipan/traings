import { HttpService } from '@nestjs/axios';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private http: HttpService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token enviado');
    }
    try {
      const url =
        'http://localhost:8080/realms/MICHIMONEY/protocol/openid-connect/token/introspect';
      const params = new URLSearchParams();
      params.append('client_secret', 'cWBFSs49Zp5cSOdvTv25KMLgYIQgXJIF');
      params.append('client_id', 'mi-app');
      params.append('token', token);
      const res = await firstValueFrom(
        this.http.post(url, params).pipe(
          catchError((error: any) => {
            if (error.response.data.error) {
              throw new UnauthorizedException('No autorizado, token invalido');
            }
            throw new UnauthorizedException(
              'Error: ' + JSON.stringify(error.response.data),
            );
          }),
        ),
      );
      if (!res.data.active) {
        throw new ForbiddenException('Token no valido');
        return;
      }
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
