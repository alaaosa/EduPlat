import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDefined,
  IsInt,
  IsNumber,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { QuestionDTO } from './question';

function normalizeArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed: unknown = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [value];
    }
  }
  return [value];
}

export class CreateExamDTO {
  @IsNumber()
  @IsInt()
  @Min(0)
  @Max(100)
  passingScore!: number;

  @IsNumber()
  @IsInt()
  @Min(1)
  duration!: number;

  @IsDefined()
  @Transform(({ value }: { value: unknown }) => normalizeArray(value))
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => QuestionDTO)
  @ValidateNested({ each: true })
  questions!: QuestionDTO[];
}
