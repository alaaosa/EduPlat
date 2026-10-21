import { BadRequestException, Injectable } from '@nestjs/common';
import { LessonType } from '../shared/enum/lesson.type';
import { VideoHandler } from '../services/video.service';
import { ExamService } from 'src/assessment/application/exam.service';
import { ExamTypes } from 'src/assessment/domain/enum/types-of-exam';

@Injectable()
export class LessonHandler {
  constructor(
    private readonly videoService: VideoHandler,
    private readonly examService: ExamService,
  ) {}

  private lessonRecord: Record<
    LessonType,
    (lessonId: number, userId: number) => Promise<any>
  > = {
    [LessonType.VIDEO]: (lessonId, userId) =>
      this.videoService.getLessonVideoPlayBackUrl(lessonId, userId),
    [LessonType.QUIZ]: (lessonId, userId) =>
      this.examService.getExamDetails(lessonId, ExamTypes.QUIZ, userId),
  };

  async getLesson(type: LessonType, lessonId: number, userId: number) {
    const handler = this.lessonRecord[type];

    if (!handler) {
      throw new BadRequestException('Unsupported lesson type');
    }
    return handler(lessonId, userId);
  }
}
