import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  Validate,
  ValidateNested,
} from 'class-validator';
import {
  CourseCategory,
  CourseLanguage,
  CourseLevel,
  CourseStatus,
} from '../shared/enum';
import { PartialType } from '@nestjs/mapped-types';
import { checkCourseBeforeReview } from '../helper/course.validate';

// @Transform(({ value }) => (value ? value.trim() : value))

export class ThumbnailDto {
  @IsString()
  declare url: string;
  @IsString()
  declare public_id: string;
}

export class CourseRequirmentsDto {
  @IsString()
  declare requirement: string;
}
export class CourseGoalDto {
  @IsString()
  declare goal: string;
}
export class CourseAudienceDto {
  @IsString()
  declare audience: string;
}

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'Title must be at least 5 characters long' })
  declare title: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  subTitle?: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsEnum(CourseCategory)
  category!: CourseCategory;

  @IsEnum(CourseLevel)
  level!: CourseLevel;

  @IsEnum(CourseLanguage)
  language!: CourseLanguage;

  @Type(() => ThumbnailDto)
  @ValidateNested({ each: true })
  image!: ThumbnailDto;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0, { message: "price can't be a negative number" })
  price?: number;

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
  @IsArray({ message: 'Requirements must be an array' })
  @ValidateNested({ each: true })
  @Type(() => CourseRequirmentsDto)
  requirements!: CourseRequirmentsDto[];

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
  @IsArray({ message: 'Goals must be an array' })
  @ValidateNested({ each: true })
  @Type(() => CourseGoalDto)
  goals!: CourseGoalDto[];

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
  @IsArray({ message: 'Audience must be an array' })
  @ValidateNested({ each: true })
  @Type(() => CourseAudienceDto)
  audiences!: CourseAudienceDto[];
}

export class UpdateCourseDto extends PartialType(CreateCourseDto) {}

export class updateCourseStatusDto {
  @IsEnum(['approve', 'reject'], { message: 'Invalid course status' })
  declare action: 'approve' | 'reject';
  @IsEnum(CourseStatus, { message: 'Invalid course status' })
  declare status: CourseStatus;

  @Validate(checkCourseBeforeReview, {
    message: 'Reason is required when rejecting a course',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Reason is required when rejecting a course' })
  declare reason: string;
}
