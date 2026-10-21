import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { AnswerDTO } from './answer';
import { QuestionTypes } from 'src/assessment/domain/enum/types-of-questions';

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

export class QuestionDTO {
  @IsString()
  @IsNotEmpty()
  @Length(10, 500)
  question!: string;

  @IsEnum(QuestionTypes)
  questionType!: QuestionTypes;

  @IsDefined()
  @Transform(({ value }: { value: unknown }) => normalizeArray(value))
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => AnswerDTO)
  @ValidateNested({ each: true })
  answers!: AnswerDTO[];
}
