import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { PurchasableTypes } from 'src/payment/enum';

export class EnrollDto {
  @IsString()
  title!: string;

  @IsEmail({}, { message: 'this not valid email ' })
  email!: string;

  @IsEnum(PurchasableTypes)
  type!: string;

  @IsInt()
  userId!: number;

  @Type(() => Number)
  itemId!: number;
}
