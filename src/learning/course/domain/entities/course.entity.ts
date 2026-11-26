import { CourseDomainError } from '../exceptions/course-domain.error';
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
    if (this.props.price < 0)
      throw new CourseDomainError(
        'Course price must be greater than or equal zero',
      );
    const publishable = [CourseStatus.DRAFT, CourseStatus.REJECTED];
    if (!publishable.includes(this.props.status))
      throw new CourseDomainError(
        'Course cannot be published from its current status',
      );
    if (states.numOfSections <= 0)
      throw new CourseDomainError('Course must have at least one section');
    if (this.props.title.trim().length < 3)
      throw new CourseDomainError(
        'Course title must contain at least 3 characters',
      );

    if (
      !this.props.category ||
      !this.props.language ||
      !this.props.thumbnail ||
      !this.props.description ||
      !this.props.level
    )
      throw new CourseDomainError('Course is missing required information');

    if (states.numEmptySections > 0)
      throw new CourseDomainError('Course cannot contain empty sections');

    if (
      (states.numGoals && states.numAudiences && states.numRequirements) === 0
    )
      throw new CourseDomainError(
        'Course must have goals, audiences, and requirements',
      );
  }

  updateStatusToPublish() {
    const notAllowed = [CourseStatus.PUBLISHED, CourseStatus.DELETED];
    if (notAllowed.includes(this.props.status))
      throw new CourseDomainError(
        'Course cannot be published from its current status',
      );
    this.props.status = CourseStatus.PUBLISHED;
    return this.props.status;
  }

  updateStatusToPending() {
    const allowed = [CourseStatus.REJECTED, CourseStatus.DRAFT];
    if (!allowed.includes(this.props.status))
      throw new CourseDomainError(
        'Course cannot be submitted for review from its current status',
      );
    this.props.status = CourseStatus.PENDING_REVIEW;
    return this.props.status;
  }

  changeStatusToRejected() {
    if (this.props.status !== CourseStatus.PENDING_REVIEW)
      throw new CourseDomainError(
        'Only courses pending review can be rejected',
      );
    this.props.status = CourseStatus.REJECTED;
    return this.props.status;
  }

  getStatus() {
    return this.props.status;
  }
  getTitle() {
    return this.props.title;
  }

  modifyPrice() {
    const price = this.props.price;
    if (price < 0 || !Number.isSafeInteger(price))
      throw new CourseDomainError(
        'Course price must be a non-negative safe integer',
      );

    if (this.props.status == CourseStatus.DELETED)
      throw new CourseDomainError('Deleted course price cannot be modified');
    return price;
  }

  checkRequirements(requirements: string[]) {}
}
