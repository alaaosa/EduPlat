import { Injectable, NotFoundException } from '@nestjs/common';
import { SectionRepository } from '../repo/section.repo';
import { LessonRepository } from 'src/lesson/repo/lesson.repo';
import { CreateSectionDto, SectionDto } from '../dto/section.dto';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize';
import { CourseRepository } from '../repo/course.repo';

@Injectable()
export class SectionService {
  constructor(
    private readonly sectionRepository: SectionRepository,
    private readonly courseRepository: CourseRepository,
    private readonly lessonRepository: LessonRepository,
    @InjectConnection() private sequlize: Sequelize,
  ) {}

  async create(
    instructerId: number,
    courseId: number,
    sectionDto: CreateSectionDto,
  ) {
    const course = await this.courseRepository.findCourseToSection(
      courseId,
      instructerId,
    );
    if (!course) throw new NotFoundException('course not found');

    const section = await this.sectionRepository.create(sectionDto, courseId);

    return section;
  }
}
