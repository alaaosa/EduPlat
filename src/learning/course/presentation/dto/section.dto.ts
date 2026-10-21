import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { LessonDto } from 'src/lesson/dto/lesson.dto';

export class SectionDto {
  @IsString()
  declare title: string;
  @IsString()
  declare description: string;

  @Transform(({ value }) => {
    if (value === null) {
      return [];
    } else if (Array.isArray(value)) {
      return value;
    } else if (typeof value === 'string') {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [parsed];
    }

    return [value];
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LessonDto)
  declare lessons: LessonDto[];
}

export class CreateSectionDto {
  @IsString()
  @IsNotEmpty()
  @Length(5, 100, {
    message: 'Title must be between 5 and 100 characters long',
  })
  declare title: string;

  @IsOptional()
  @IsString()
  description?: string;
}
