import { Interval } from '@nestjs/schedule';

export class DeleteRejectedCourseReasons {
  @Interval(86400000)
  delete() {
    
  }
}
