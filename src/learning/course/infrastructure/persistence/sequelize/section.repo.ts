import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Section } from '../models/section.entity';
import { CreationAttributes, Transaction } from 'sequelize';

@Injectable()
export class SectionRepository {
  private readonly sectionRelations = [
    {
      model: Section,
    },
  ];

  constructor(
    @InjectModel(Section)
    private readonly sectionModel: typeof Section,
  ) {}

  async create(
    section: Omit<CreationAttributes<Section>, 'courseId'>,
    courseId: number,
    transaction?: Transaction,
  ) {
    return this.sectionModel.create(
      { ...section, courseId },
      { transaction },
    );
  }
}
