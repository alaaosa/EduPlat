import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { updateCourseStatusDto } from '../dto/create-course.dto';

@ValidatorConstraint({
  name: 'checkCourseBeforeReview',
  async: true,
})
export class CheckCourseBeforeReview implements ValidatorConstraintInterface {
  validate(value: any, validationArguments?: ValidationArguments): boolean {
    const dto = validationArguments?.object as updateCourseStatusDto;
    if (dto.action === 'reject') {
      return !!dto.reason && dto.reason.trim().length > 0;
    } else {
      return true;
    }
    return true;
  }
  defaultMessage?(validationArguments?: ValidationArguments): string {
    throw new Error('must exist reason when rejecting a course');
  }
}
