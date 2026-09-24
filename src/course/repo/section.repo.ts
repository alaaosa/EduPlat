import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Section } from '../entities/section.entity';
import { HandleException } from 'src/db/db.service';
import { CreationAttributes, Transaction } from 'sequelize';

@Injectable()
export class SectionRepository {
  private readonly sectionRelations = [
    {
      model: Section,
    },
  ];

  constructor(
    private readonly handleException: HandleException,
    @InjectModel(Section)
    private readonly sectionModel: typeof Section,
  ) {}

  create(
    section: Omit<CreationAttributes<Section>, 'courseId'>,
    courseId: number,
    transaction?: Transaction,
  ) {
    return this.handleException.handle(async () => {
      return this.sectionModel.create(
        { ...section, courseId },
        { transaction },
      );
    });
  }
}
