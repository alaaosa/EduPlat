import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { HandleException } from 'src/db/db.service';
import { Progress as CourseProgress, Progress } from '../entities/progress';
import { CreationAttributes } from 'sequelize';

@Injectable()
export class CourseProgressRepository {
  constructor(
    private readonly handleException: HandleException,
    @InjectModel(CourseProgress)
    private readonly courseProgressModel: typeof CourseProgress,
    @InjectConnection() private readonly sequelize: Sequelize,
  ) {}

  updateProgress(data: Omit<CreationAttributes<Progress>, ''>) {
    return this.handleException.handle(() =>
      this.courseProgressModel.upsert(data),
    );
  }
}
