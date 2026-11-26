export interface CourseEvents {
  'course.rejected': {
    instructerId: number;
    title: string;
    email: string;
    reason: string;
  };

  'course.review': {
    title: string;
    email: string;
    instructorId: number;
  };

  'course.published': {
    title: string;
    email: string;
    instructerId: number;
  };
}
