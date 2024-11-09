import {
  Injectable,
  CanActivate,
  RequestTimeoutException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/application/prisma/prisma.service';

@Injectable()
export class CheckDatabaseConnectionGuard implements CanActivate {
  constructor(private readonly prismaService: PrismaService) {}

  async canActivate(): Promise<boolean> {
    if (!this.prismaService.isConnected) {
      throw new RequestTimeoutException(
        'Database is not available at the moment',
      );
    }
    return true;
  }
}
