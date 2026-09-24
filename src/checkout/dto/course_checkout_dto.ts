import { IsInt, IsPositive, IsString, Length } from 'class-validator';

export class course_checkout_dto {
  @IsString()
  @Length(6, 6, { message: 'coupon not valid' })
  coupon!: string;

  @IsPositive({ message: 'price must be a positive' })
  price!: number;
}
