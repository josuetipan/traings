import { ApiProperty } from '@nestjs/swagger';

export class ErrorDto {
  code: string;

  message: string;
  timestamp: string;

  service: string;
}
