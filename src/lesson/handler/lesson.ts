import { BadRequestException, Injectable } from '@nestjs/common';
import { LessonType } from '../shared/enum/lesson.type';
import { VideoHandler } from '../handlers/video.handler';
import { QuizService } from 'src/assessment2/quiz/quiz.service';

@Injectable()
export class LessonHandler {
  constructor(
    private readonly videoService: VideoHandler,
    private readonly quizService: QuizService,
  ) {}

  private lessonRecord: Record<
    LessonType,
    (lessonId: number, userId: number) => Promise<any>
  > = {
    [LessonType.VIDEO]: (lessonId, userId) =>
      this.videoService.getLessonVideoPlayBackUrl(lessonId, userId),
    [LessonType.QUIZ]: (lessonId, userId) =>
      this.quizService.findByLessonId(lessonId, userId),
  };

  async getLesson(type: LessonType, lessonId: number, userId: number) {
    const handler = this.lessonRecord[type];

    if (!handler) {
      throw new BadRequestException('Unsupported lesson type');
    }
    return handler(lessonId, userId);
  }
}
