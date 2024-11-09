import {
  IsArray,
  IsBoolean,
  // IsDateString,
  IsInt,
  IsNotEmpty,
  // IsNumber,
  // IsPositive,
  IsString,
  IsUUID,
  // Max,
  // Min,
} from 'class-validator';

class AnswerDto {
  @IsUUID()
  @IsNotEmpty()
  @IsString()
  idQuestion: string;

  @IsUUID()
  @IsNotEmpty()
  @IsString()
  idAnswer: string;

  @IsString()
  userAnswer: string; // El valor que se envía debe ser solo la respuesta

  @IsBoolean()
  isCorrect: boolean;

  @IsInt()
  assignedScore: number;
}

export class CreateQuizResultDto {
  @IsUUID()
  @IsNotEmpty()
  @IsString()
  idQuiz: string;

  // @IsUUID()
  // @IsNotEmpty()
  // @IsString()
  // idStatus: string;

  @IsUUID()
  @IsNotEmpty()
  @IsString()
  idUserRole: string;

  // @IsNotEmpty()
  // @IsString()
  // lastModifiedBy: string;

  // @IsInt({ message: 'El campo attempts debe ser un número entero' })
  // @IsPositive({ message: 'El campo attempts debe ser un valor positivo' })
  // attempts: number;

  // @IsInt({ message: 'El campo score debe ser un número entero' })
  // @Min(0, { message: 'El campo score no puede ser negativo' })
  // @Max(100, { message: 'El campo score no puede exceder 100' })
  // @IsNumber()
  // @IsNotEmpty()
  // scoreTotal: number;

  // @IsNotEmpty()
  // @IsDateString()
  // completedAt:string;

  @IsArray()
  answers: AnswerDto[]; // Solo se debe enviar la respuesta del usuario, sin propiedades extra
}
