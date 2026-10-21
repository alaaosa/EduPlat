import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LessonRepository } from '../repo/lesson.repo';
import { LessonDto } from '../dto/lesson.dto';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize';
import { CourseRepository } from 'src/learning/course/infrastructure/persistence/sequelize/course.repo';
import { LessonHandler } from '../handler/lesson';

@Injectable()
export class LessonService {
  constructor(
    @InjectConnection() private sequlize: Sequelize,
    private readonly lessonRepository: LessonRepository,
    private readonly courseRepository: CourseRepository,
    private readonly lessonHandler: LessonHandler,
  ) {}

  async create(courseId: number, sectionId: number, dto: LessonDto) {
    return this.sequlize.transaction(async (transaction) => {
      const lastLessonOrder = (await this.lessonRepository.findLastLessonOrder(
        sectionId,
      )) as number;

      const [lesson, _] = await Promise.all([
        this.lessonRepository.create(
          sectionId,
          { ...dto, order: (lastLessonOrder ?? 0) + 1 },
          transaction,
        ),
        this.courseRepository.incrementLessonsCount(courseId, transaction),
      ]);

      return lesson;
    });
  }

  /**
   * @param sectionId
   * @desciption :  get all lessons of a section with their video and quiz in course details page before user enrolls in the course
   */
  async findLessons(sectionId: number) {
    const lessons = await this.lessonRepository.findLessons(sectionId);

    if (lessons.length === 0) throw new NotFoundException('Lessons not found');

    return lessons;
  }

  /**
   * @param sectionId
   * @desciption :  get all lessons of a section with their video and quiz in course details page for enrolled users
   * get lesson (video or quiz) by lesson type  for enrolled user
   *
   */

  // don't forget useGuard
  async findLessonsForEnrolledUsers(
    courseId: number,
    sectionId: number,
    lessonId: number,
    userId: number,
  ) {
    const lesson =
      await this.lessonRepository.findLessonsForEnrolledUser(lessonId);
    if (!lesson) throw new NotFoundException('lesson not found');

    if (
      lesson.section.id !== sectionId ||
      lesson.section.course.id !== courseId
    )
      throw new ForbiddenException('this lesson not contains to this course ');

    return this.lessonHandler.getLesson(lesson.type, lessonId, userId);
  }

  // update lesson preview by instructer
  async updateLessonPreview(
    lessonId: number,
    isPreview: boolean,
    instructerId: number,
  ) {
    const lesson = await this.lessonRepository.findLessonById(lessonId);

    if (!lesson) throw new BadRequestException('Lesson not found');

    if (lesson.section.course.instructerId !== instructerId)
      throw new ForbiddenException(
        'You are not authorized to update this lesson',
      );

    lesson.isPreview = isPreview;
    await lesson.save();
    return lesson;
  }

  // http://eduPlat:12073/lesson/:lessonId
  // get PlayBack URL for lesson video
  // async getLessonVideoPlayBackUrl(
  //   lessonId: number,
  //   userId: number,
  // ): Promise<{
  //   url: string;
  //   duration: number;
  //   videoId: number;
  //   states: { progress: number; completed: boolean } | null;
  // }> {
  //   const lesson = await this.lessonRepository.getLessonVideo(lessonId, userId);

  //   if (!lesson) throw new BadRequestException('Lesson not found');

  //   if (lesson.type !== LessonType.VIDEO)
  //     throw new NotFoundException('Lesson is not a video');

  //   const isEnrolled = lesson.section.course.enrollments.length > 0;

  //   if (!isEnrolled && !lesson.isPreview)
  //     throw new ForbiddenException('You are not enrolled in this course');

  //   if (!lesson.video) throw new BadRequestException('Video not found');

  //   const token = await this.muxService.generateSignedToken(
  //     lesson.video.playbackId,
  //   );

  //   const playbackUrl = `https://stream.mux.com/${lesson.video.playbackId}.m3u8?token=${token}`;

  //   return {
  //     url: playbackUrl,
  //     duration: lesson.video.duration,
  //     videoId: lesson.video.id,
  //     states: lesson.video.progress
  //       ? {
  //           progress: lesson.video.progress.progress,
  //           completed: lesson.video.progress.completed,
  //         }
  //       : null,
  //   };
  // }
}
