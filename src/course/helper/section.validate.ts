import { NotAcceptableException } from '@nestjs/common';
import { Section } from '../entities/section.entity';
import { checkLessonsBeforeReview } from './lesson.validate';

// check all required fields for section are filled before sending course for review
export const checkSectionBeforeReview = async (sections: Section[]) => {
  sections.map(async ({ title, description, lessons }) => {
    if (!title || title.length < 5 || title.length > 100)
      throw new Error(
        'All sections must have a title before sending course for review and title must be between 5 and 100 characters long',
      );

    if (lessons.length === 0)
      throw new NotAcceptableException(
        'must be at least one lesson at each section',
      );

    if (description && description.length > 800) {
      throw new Error(
        'All sections must have a description before sending course for review and description must be less than 800 characters long',
      );
    }

    await checkLessonsBeforeReview(lessons);
  });

  return true;
};
