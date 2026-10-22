import { IsEnum, IsInt, IsPositive } from 'class-validator';
import { ExamTypes } from 'src/assessment/domain/enum/types-of-exam';

export class payloadDTO {
  @IsInt({ message: 'assessmentId must be a integer number' })
  assessmentId!: number;

  @IsPositive({ message: 'score must be a positive number' })
  score!: number;

  @IsInt({ message: 'userId must be a integer number' })
  userId!: number;

  @IsEnum(ExamTypes)
  type!: ExamTypes;

  @IsInt({ message: 'attemptId must be a integer number' })
  attemptId!: number;
}
