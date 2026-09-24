import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  Min,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { questionType } from '../models/MCQ&TF/question';

export class mcq_tf_questionDto {
  @IsString()
  @MinLength(5, { message: 'Question must be at least 5 char' })
  @IsNotEmpty({ message: 'type a question !!' })
  declare question: string;

  @IsEnum(questionType, { message: 'questionType must be either mcq or tf' })
  declare questionType: questionType;
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
  @Type(() => Mcq_TF_AnswerDto)
  declare answers: Mcq_TF_AnswerDto[];
}
export class Mcq_TF_AnswerDto {
  @IsString()
  declare answer: string;
  @IsBoolean()
  declare isCorrect: boolean;
}

export class choiceDto {
  @IsInt()
  declare questionId: number;
  @IsInt()
  declare answerId: number;

  @IsInt()
  @Min(0)
  declare revision: number;
}

// export class ExamAnswerChooseAndTrueFalseDTO {
//   @IsInt()
//   declare questionId: number;
//   @IsInt()
//   declare answerId: number;
// }

// export class Evaluate {
//   @IsNumber()
//   declare quizId: number;
//   @Transform(({ value }) => {
//     if (value == null) return [];
//     if (Array.isArray(value)) {
//       return value;
//     } else if (typeof value === 'string') {
//       const parsedValue = JSON.parse(value);
//       return Array.isArray(parsedValue) ? parsedValue : [parsedValue];
//     }
//     return [value];
//   })
//   @ValidateNested({ each: true })
//   @Type(() => StudentAnswerDTO)
//   declare answers: StudentAnswerDTO[];
// }

// export class StudentAnswerDTO {
//   @IsNumber()
//   declare questionId: number;
//   @IsNumber()
// declare answerId: number;
// }
