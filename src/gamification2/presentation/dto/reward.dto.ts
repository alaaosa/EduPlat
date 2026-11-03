import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsPositive,
  IsString,
  IsUrl,
  MinLength,
  Validate,
  ValidateNested,
} from 'class-validator';
import { RewardType } from 'src/gamification2/domain/shared/enum/reward.enum';
import { RewardDetailsValidator } from '../../application/validator/reward.valid';

type dtoTypes = RewardDiscountDTO;

class Image {
  @IsUrl()
  url!: string;

  @IsString()
  public_id!: string;
}

export class RewardDiscountDTO {
  @IsInt()
  @IsPositive()
  discount_value!: number;
}

export class RewardDto {
  @Type(() => Image)
  @ValidateNested({ each: true })
  image!: Image;

  @IsEnum(RewardType)
  rewardType!: RewardType;

  @IsString()
  @MinLength(3, { message: 'min char is 3 ' })
  title!: string;

  @IsString()
  @MinLength(3, { message: 'min char is 3 ' })
  description!: string;

  @IsPositive()
  cost!: number;

  @Validate(RewardDetailsValidator)
  detailsDto!: dtoTypes;
  // @Type(() => RewardDiscountDTO, {
  //   discriminator: {
  //     property: 'rewardType',
  //     subTypes: [
  //       {
  //         name: RewardType.DISCOUNT,
  //         value: RewardDiscountDTO,
  //       },
  //     ],
  //   },
  //   keepDiscriminatorProperty: true,
  // })
  // @ValidateNested({ each: true })
  // detailsDto!: dtoTypes;
}
