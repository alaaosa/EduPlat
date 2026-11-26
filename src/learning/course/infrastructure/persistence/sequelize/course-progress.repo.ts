import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Progress as CourseProgress, Progress } from '../models/progress';
import { CreationAttributes } from 'sequelize';

@Injectable()
export class CourseProgressRepository {
  constructor(
    @InjectModel(CourseProgress)
    private readonly courseProgressModel: typeof CourseProgress,
    @InjectConnection() private readonly sequelize: Sequelize,
  ) {}

  async updateProgress(data: Omit<CreationAttributes<Progress>, ''>) {
    return this.courseProgressModel.upsert(data);
  }
}
