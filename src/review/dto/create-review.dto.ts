import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty()
  @IsString()
  @Length(20, 225, {
    message: 'Review must be between 20 and 225 characters long',
  })
  comment!: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1, { message: 'Rating must be between 1 and 5' })
  @Max(5, { message: 'Rating must be between 1 and 5' })
  rating!: number;
}
