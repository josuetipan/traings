import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateTrainingProgresDto {
  @IsString()
  @IsUUID()
  idUser?: string;

  @IsString()
  @IsUUID()
  idTraining?: string;

  @IsString()
  @IsUUID()
  idStatus?: string;

  @IsNumber()
  progressPercentage?: number;

  @IsString()
  @IsUUID()
  idTrainingSection?: string;

  @IsString()
  @IsUUID()
  idTrainingContent?: string;
}
