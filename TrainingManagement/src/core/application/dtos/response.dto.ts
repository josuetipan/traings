import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto {
  @ApiProperty({ description: 'Unique code for the response' })
  code: string;

  @ApiProperty({ description: 'Name of the response' })
  name: string;
}
