import { IsInt, IsNumber } from 'class-validator';

export class StudentAnswerDTO {
  @IsNumber()
  @IsInt()
  questionId!: number;
  @IsNumber()
  @IsInt()
  answerId!: number;
  @IsNumber()
  @IsInt()
  attemptId!: number;
}
