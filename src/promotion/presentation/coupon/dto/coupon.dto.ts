import { Type } from 'class-transformer';
import {
  IsAlpha,
  IsDate,
  IsDateString,
  IsEnum,
  IsInt,
  IsPositive,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';
import { CouponType } from 'src/learning/course/domain/enums/coupon.enum';

export class CreateCouponDTO {
  @IsString()
  @Length(6, 6)
  @Matches(/^[A-Z_-]+$/, {
    message: 'Code can contain only uppercase letters, "_" and "-"!!!',
  })
  declare coupon: string;

  @Type(() => Date)
  @IsDate()
  declare endsAt: Date;

  @IsPositive({ message: 'negative number or zero not available' })
  declare maxUsage: number;

  @IsPositive({ message: 'negative number or zero not available' })
  declare discountValue: number;

  @IsEnum(CouponType, { message: 'this type not valid' })
  declare couponType: CouponType;
}

export class CouponUserDTO {
  @IsString()
  @Length(6, 6)
  @Matches(/^[A-Z_-]+$/, {
    message: 'Code can contain only uppercase letters, "_" and "-"!!!',
  })
  declare coupon: string;
}
