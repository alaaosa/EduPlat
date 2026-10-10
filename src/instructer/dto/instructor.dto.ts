import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsStrongPassword,
  IsUrl,
} from 'class-validator';
import { YEARS_OF_EXPERIENCE } from '../shared/enum';
import { Transform, Type } from 'class-transformer';

export class UpdatePasswordDTO {
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password is not strong enough , it should contain at least 8 characters, Upper , lower and special characters',
    },
  )
  newPassword!: string;
}

export class returnedFilesDTO {
  @IsString()
  url!: string;

  @IsString()
  public_id!: string;

  @IsString()
  type!: string;
}

export class CreateInstructerDTO {
  @IsEnum(YEARS_OF_EXPERIENCE, {
    message: `Not a valid years of experience`,
  })
  yearsOfExperience!: YEARS_OF_EXPERIENCE;

  @IsString({ message: 'string only' })
  courseIdea!: string;

  @IsString({ message: 'string only' })
  aboutMe!: string;

  @IsString({ message: 'string only' })
  certification!: string;

  @IsUrl({}, { message: 'string only' })
  linkedIn!: string;

  @IsOptional()
  @IsUrl({}, { message: 'string only' })
  portfolio!: string;

  @Transform(({ value }) => {
    if (value == null) return [];
    if (typeof value === 'string') {
      const parse = JSON.parse(value);
      Array.isArray(parse) ? parse : [parse];
    }

    if (Array.isArray(value)) return value;

    return [value];
  })
  @Type(() => returnedFilesDTO)
  @IsArray({ each: true })
  uploadedFiles!: returnedFilesDTO[];
}
