import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';
import { LessonType } from '../shared/enum/lesson.type';

export class LessonDto {
  @IsString()
  @IsNotEmpty()
  @Length(5, 100, {
    message: 'Title must be between 5 and 100 characters long',
  })
  title!: string;

  @IsBoolean()
  declare isPreview: boolean;

  @IsEnum(LessonType)
  type!: LessonType;
}

export class Type {
  @IsString()
  declare type: string;
}

export class FindLessonsDto {
  @IsNumber()
  @IsPositive()
  @IsInt()
  sectionId!: number;
}

export class findLessonsForEnrolledUsersDTO {
  @IsEnum(LessonType, { message: "can't get the lesson" })
  type!: LessonType;
}
