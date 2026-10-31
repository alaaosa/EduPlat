import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';
import { PurchasableTypes } from 'src/payment/domain/enum/purchasable-types.enum';

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

  @IsUUID()
  idempotency_key!: string;
}
