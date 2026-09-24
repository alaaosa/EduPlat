import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { RewardDiscountDTO, RewardDto } from '../dto/reward.dto';
import { RewardType } from 'src/gamification/shared/enum/reward.enum';

@ValidatorConstraint({ name: 'RewardDetails', async: false })
export class RewardDetailsValidator implements ValidatorConstraintInterface {
  validate(value: any, validationArguments?: ValidationArguments): boolean {
    const dto = validationArguments?.object as RewardDto;

    switch (dto.rewardType) {
      case RewardType.DISCOUNT:
        return value instanceof RewardDiscountDTO || this.isDiscountDto(value);

      default:
        return false;
    }
  }

  private isDiscountDto(value: any): boolean {
    return (
      typeof value === 'object' && typeof value.discount_value === 'number'
    );
  }
  defaultMessage(args: ValidationArguments): string {
    const dto = args.object as RewardDto;

    return `detailsDto is invalid for rewardType ${dto.rewardType}`;
  }
}
