import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AnswerDTO {
  @IsString()
  @IsNotEmpty()
  answer!: string;

  @IsOptional()
  @IsBoolean()
  @IsNotEmpty()
  isCorrect?: boolean;
}
