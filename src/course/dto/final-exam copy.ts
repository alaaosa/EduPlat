import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class FinalExamDto {
  @IsNumber({}, { message: 'score must be a number ("class validter")' })
  declare passingScore: number;

  @IsNumber()
  declare duration: number;

  @Transform(({ value }) => {
    if (value == null) return [];
    if (Array.isArray(value)) {
      return value;
    } else if (typeof value === 'string') {
      const parsedValue = JSON.parse(value);
      return Array.isArray(parsedValue) ? parsedValue : [parsedValue];
    }
    return [value];
  })
  @ValidateNested({ each: true })
  @Type(() => FinalQuestionDto)
  declare questions: FinalQuestionDto[];
}

export class FinalQuestionDto {
  @IsString()
  @MinLength(5, { message: 'Question must be at least 5 char' })
  @IsNotEmpty({ message: 'type a question !!' })
  declare question: string;
  @Transform(({ value }) => {
    if (value == null) return [];
    if (Array.isArray(value)) {
      return value;
    } else if (typeof value === 'string') {
      const parsedValue = JSON.parse(value);
      return Array.isArray(parsedValue) ? parsedValue : [parsedValue];
    }
    return [value];
  })
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  declare answers: AnswerDto[];
}
export class AnswerDto {
  @IsString()
  declare answer: string;
  @IsBoolean()
  declare isCorrect: boolean;
}
