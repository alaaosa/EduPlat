import { IsEnum, IsInt, IsNumber } from 'class-validator';
import { ExamTypes } from 'src/assessment/domain/shared/enum/types-of-exam';

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
  @IsEnum(ExamTypes)
  examType!: ExamTypes;
}
