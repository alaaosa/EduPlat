import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class SectionDto {
  @IsString()
  @IsNotEmpty()
  declare title: string;
  @IsString()
  declare description: string;
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
