import { Transform, Type } from 'class-transformer';
import { IsNumber, Max, Min, ValidateNested } from 'class-validator';
import { mcq_tf_questionDto } from 'src/assessment2/dto/mcq&tf';

export class CreateFinalDto {
  @IsNumber()
  @Min(30, { message: 'duration must be at least 30 minutes' })
  @Max(180, { message: 'duration must be at most 180 minutes' })
  declare duration: number;

  @IsNumber()
  @Min(0, { message: 'passingScore must be a positive number' })
  @Max(100, { message: 'passingScore must be at most 100' })
  declare passingScore: number;

  @Transform(({ value }) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [parsed];
    }
    return [value];
  })
  @ValidateNested({ each: true })
  @Type(() => mcq_tf_questionDto)
  declare mcq_tf_questions: mcq_tf_questionDto[];
}
