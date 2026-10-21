import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Lesson } from '../models/lesson.model';
import { HandleException } from 'src/db/db.service';
import { CreationAttributes, LOCK, Sequelize, Transaction } from 'sequelize';
import { VideoRepository } from './video.repo';
import { Video } from '../models/types/video.model';
import { Quiz } from 'src/assessment2/quiz/entities/quiz.entity';
import { Section } from 'src/learning/course/infrastructure/persistence/models/section.entity';
import { Course } from 'src/learning/course/infrastructure/persistence/models/course.entity';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { Progress } from '../models/lesson.user';
import { CourseRepository } from 'src/learning/course/infrastructure/persistence/sequelize/course.repo';
import { model } from 'mongoose';

@Injectable()
export class LessonRepository {
  constructor(
    private handleException: HandleException,

    @InjectModel(Lesson) private lessonModel: typeof Lesson,
    @InjectConnection() private readonly sequlize: Sequelize,
  ) {}

  bulkCreate(
    lessons: Omit<CreationAttributes<Lesson>, 'id'>[],
    sectionId: number,
    transaction?: Transaction,
  ) {
    return this.handleException.handle(async () => {
      return this.lessonModel.bulkCreate(
        lessons.map((l) => {
          return {
            ...l,
            sectionId,
          };
        }),
        { transaction },
      );
    });
  }

  create(
    sectionId: number,
    lesson: Omit<CreationAttributes<Lesson>, 'sectionId'>,
    transaction?: Transaction,
  ) {
    return this.handleException.handle(async () => {
      return this.lessonModel.create({ sectionId, ...lesson }, { transaction });
    });
  }

  findLastLessonOrder(sectionId: number) {
    return this.handleException.handle(async () => {
      return this.lessonModel.max('order', {
        where: { sectionId },
      });
    });
  }

  /**
   * @param sectionId  
   * @description  :get all lessons of a section with their video and quiz in course details page before user enrolls in the course  
   */
  findLessons(sectionId: number) {
    return this.handleException.handle(async () =>
      this.lessonModel.findAll({
        where: { sectionId },
        attributes: ['id', 'type', 'order', 'isPreview', 'title'],
        include: [
          {
            model: Video,
            as: 'video',
            attributes: ['id', 'duration'],
            required: false,
          },
          {
            model: Quiz,
            as: 'quiz',
            attributes: ['id', 'duration'],
            required: false,
          },
        ],
        order: [['order', 'ASC']],
      }),
    );
  }

  updateLesson(
    lessonId: number,
    updateData: Partial<Lesson>,
    transaction?: Transaction,
  ) {
    return this.handleException.handle(async () => {
      return this.lessonModel.update(updateData, {
        where: { id: lessonId },
        transaction,
      });
    });
  }

  findLessonById(lessonId: number) {
    return this.handleException.handle(async () => {
      return this.lessonModel.findByPk(lessonId, {
        include: [
          {
            model: Section,
            as: 'section',
            attributes: [],
            include: [
              {
                model: Course,
                as: 'course',
                attributes: ['id', 'instructorId'],
              },
            ],
          },
        ],
        lock: LOCK.UPDATE,
      });
    });
  }

  getLessonVideo(lessonId: number, userId: number) {
    return this.handleException.handle(async () => {
      return this.lessonModel.findOne({
        where: { id: lessonId },
        include: [
          {
            model: Section,
            as: 'section',
            attributes: [],
            include: [
              {
                model: Course,
                as: 'course',
                attributes: ['id'],
                include: [
                  {
                    model: Enrollment,
                    as: 'enrollments',
                    attributes: ['id'],
                    where: { userId },
                    required: false,
                  },
                ],
              },
            ],
          },
          {
            model: Video,
            as: 'video',
            attributes: ['id', 'duration', 'playbackId'],
            include: [
              {
                model: Progress,
                as: 'progress',
                attributes: ['progress', 'completed'],
                where: { userId },
                required: false,
              },
            ],
          },
        ],
      });
    });
  }

  /**
   *
   * @param  courseId
   * @param  sectionId
   * @param  lessonId
   * @description  
   */

  findLessonsForEnrolledUser(lessonId: number) {
    return this.handleException.handle(async () =>
      this.lessonModel.findOne({
        where: { id: lessonId },
        attributes: ['id', 'type'],
        include: [
          {
            model: Section,
            as: 'section',
            attributes: ['id'],
            required: true,
            include: [
              {
                model: Course,
                attributes: ['id'],
                required: true,
              },
            ],
          },
        ],
      }),
    );
  }

  getCourseIdByLessonId(lessonId: number) {
    return this.handleException.handle(async () => {
      return this.lessonModel.findOne({
        where: { id: lessonId },
        attributes: [],
        include: [
          {
            model: Section,
            as: 'section',
            attributes: [],
            include: [
              {
                model: Course,
                as: 'course',
                attributes: ['id', 'instructerId'],
                required: true,
              },
            ],
          },
        ],
      });
    });
  }

  getLessonById(lessonId: number) {
    return this.handleException.handle(async () => {
      return this.lessonModel.findByPk(lessonId, {
        attributes: ['id', 'type'],
      });
    });
  }

  getInstructerId(lessonId: number) {
    return this.handleException.handle(async () =>
      this.lessonModel.findByPk(lessonId, {
        attributes: [],
        include: [
          {
            model: Section,
            attributes: [],
            required: true,
            include: [
              {
                model: Course,
                attributes: ['instructerId'],
                required: true,
              },
            ],
          },
        ],
      }),
    );
  }

}
