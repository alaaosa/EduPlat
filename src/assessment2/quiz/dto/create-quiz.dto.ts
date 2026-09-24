import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { mcq_tf_questionDto } from 'src/assessment2/dto/mcq&tf';

function normalizeQuestionDtos(value: unknown): unknown[] {
  if (value == null || value === '') return [];
  if (Array.isArray(value)) return value as unknown[];
  if (typeof value === 'string') {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as unknown[]) : [parsed];
  }
  return [value];
}

export class CreateQuizDto {
  @IsInt()
  @IsNotEmpty({ message: 'lessonId is required' })
  declare lessonId: number;

  @IsInt()
  @Min(1, { message: 'duration must be at least 1 minute' })
  @Max(180, { message: 'duration must be at most 180 minutes' })
  declare duration: number;

  @Transform(({ value }: { value: unknown }) => normalizeQuestionDtos(value))
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => mcq_tf_questionDto)
  declare mcq_tf_questions: mcq_tf_questionDto[];
}
