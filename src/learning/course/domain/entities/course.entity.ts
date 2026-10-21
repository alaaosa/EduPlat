import { BadRequestException, ConflictException } from '@nestjs/common';
import {
  CourseCategory,
  CourseLanguage,
  CourseLevel,
  CourseStatus,
} from 'src/learning/course/domain/enums';

export type PublishStats = {
  numOfSections: number;
  numEmptySections: number;
  numRequirements: number;
  numAudiences: number;
  numGoals: number;
};

export type CourseProps = {
  id: number;
  title: string;
  category: CourseCategory;
  level: CourseLevel;
  language: CourseLanguage;
  status: CourseStatus;
  price: number;
  description: string;
  thumbnail: string;
};
export class CourseEntity {
  constructor(private props: CourseProps) {}

  static instance(props: CourseProps) {
    return new CourseEntity(props);
  }

  check(states: PublishStats): void {
    if (!this.props.price || this.props.price < 0)
      throw new BadRequestException();
    const publishable = [CourseStatus.DRAFT, CourseStatus.REJECTED];
    if (!publishable.includes(this.props.status))
      throw new BadRequestException();
    if (states.numOfSections <= 0) throw new BadRequestException();
    if (this.props.title.trim().length < 3) throw new BadRequestException();

    if (
      !this.props.category ||
      !this.props.language ||
      !this.props.thumbnail ||
      !this.props.description ||
      !this.props.level
    )
      throw new BadRequestException();

    if (states.numEmptySections > 0) throw new BadRequestException();

    if (
      (states.numGoals && states.numAudiences && states.numRequirements) === 0
    )
      throw new BadRequestException();
  }

  updateStatusToPublish() {
    const notAllowed = [CourseStatus.PUBLISHED, CourseStatus.DELETED];
    if (notAllowed.includes(this.props.status)) throw new ConflictException();
    this.props.status = CourseStatus.PUBLISHED;
    return this.props.status;
  }

  updateStatusToPending() {
    const allowed = [CourseStatus.REJECTED, CourseStatus.DRAFT];
    if (!allowed.includes(this.props.status)) throw new ConflictException();
    this.props.status = CourseStatus.PENDING_REVIEW;
    return this.props.status;
  }

  changeStatusToRejected() {
    if (this.props.status !== CourseStatus.DRAFT) throw new ConflictException();
    this.props.status = CourseStatus.REJECTED;
    return this.props.status;
  }

  getStatus() {
    return this.props.status;
  }

  modifyPrice() {
    const price = this.props.price;
    if (price < 0 || !Number.isSafeInteger(price))
      throw new BadRequestException();

    if (this.props.status == CourseStatus.DELETED)
      throw new BadRequestException();
    return price;
  }

  checkRequirements(requirements : string[]){


  }
}
