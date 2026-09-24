import { Lesson } from 'src/lesson/models/lesson.model';

// check if all required fields for lesson are filled before sending course for review
export const checkLessonsBeforeReview = async(lessons: Lesson[]) => {
  lessons.map(({ title }) => {
    if (!title || title.length < 5 || title.length > 100) {
      throw new Error(
        'All lessons must have a title before sending course for review and title must be between 5 and 100 characters long',
      );
    }
  });

  return true;
};
