import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { examType } from '../models/MCQ&TF/question';
import { Transform, Type } from 'class-transformer';

export class JoinAssessmentDto {
  @IsInt()
  assessmentId!: number;

  @IsInt()
  attemptId!: number;

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => user)
  user!: user;

  @IsEnum(examType)
  type!: examType;
}

class user {
  @IsInt()
  id!: number;
  @IsString()
  name!: string;
}
