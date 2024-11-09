import { IsBoolean, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateContentProgressDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  idContentProgress: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  idTrainingContent: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  idUser: string;

  @IsBoolean()
  @IsNotEmpty()
  isCompleted: boolean;
}
