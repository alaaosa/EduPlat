import { Injectable, NotFoundException } from '@nestjs/common';
import { SectionRepository } from '../infrastructure/persistence/sequelize/section.repo';
import { CreateSectionDto } from '../presentation/dto/section.dto';
import { CourseRepository } from '../infrastructure/persistence/sequelize/course.repo';

@Injectable()
export class SectionService {
  constructor(
    private readonly sectionRepository: SectionRepository,
    private readonly courseRepository: CourseRepository,
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
