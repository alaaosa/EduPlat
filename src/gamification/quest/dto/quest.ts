import { IsEnum, IsInt, IsPositive } from 'class-validator';
import { examType } from 'src/assessment2/models/MCQ&TF/question';

export class payloadDTO {
  @IsInt({ message: 'assessmentId must be a integer number' })
  assessmentId!: number;

  @IsPositive({ message: 'score must be a positive number' })
  score!: number;

  @IsInt({ message: 'userId must be a integer number' })
  userId!: number;

  @IsEnum(examType)
  type!: examType;

  @IsInt({ message: 'attemptId must be a integer number' })
  attemptId!: number;
}
