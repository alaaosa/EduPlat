import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Video } from '../models/types/video.model';
import { HandleException } from 'src/db/db.service';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { CreationAttributes, LOCK, Sequelize, Transaction } from 'sequelize';
import { Progress } from '../models/lesson.user';

@Injectable()
export class VideoRepository {
  constructor(
    private readonly handleException: HandleException,
    @InjectModel(Video)
    private readonly videoModel: typeof Video,
    @InjectModel(Progress)
    private readonly progressModel: typeof Progress,
    @InjectConnection() private readonly sequelize: Sequelize,
  ) {}

  async create(
    video: Omit<CreationAttributes<Video>, ''>,
    transaction?: Transaction,
  ) {
    return this.handleException.handle(async () => {
      await this.videoModel.upsert(video, { transaction });
    });
  }

  async update(lessonId: number, data: Partial<Video>) {
    return this.handleException.handle(async () => {
      return this.videoModel.update(data, {
        where: { lessonId },
      });
    });
  }

  findAllByLessonId(lessonId: number) {
    return this.handleException.handle(async () => {
      return this.videoModel.findOne({
        where: { lessonId },
      });
    });
  }

  async createOrUpdateLessonUserProgress(
    progress: number,
    videoId: number,
    userId: number,
    transaction?: Transaction,
  ) {
    return this.handleException.handle(async () => {
      const video = await this.videoModel.findByPk(videoId, {
        attributes: ['duration'],
        transaction,
      });

      if (!video) throw new NotFoundException('Video not found');

      if (progress < 0 || progress > video.duration)
        throw new BadRequestException('Invalid progress');

      const completed = progress >= video.duration * 0.8;

      const [instance] = await this.progressModel.upsert(
        {
          progress,
          videoId,
          userId,
          completed,
        },
        { transaction },
      );

      return instance;
    });
  }

  findVideoProgressByUserId(videoId: number, userId: number) {
    return this.handleException.handle(async () => {
      return this.progressModel.findOne({
        where: { videoId, userId },
        attributes: ['progress', 'completed'],
      });
    });
  }

  getLessonVideo(lessonId: number, userId: number) {
    return this.handleException.handle(async () =>
      this.videoModel.findOne({
        where: { lessonId },
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
      }),
    );
  }

  findCountCompleted(
    userId: number,
    videoIds: number[],
    completed: boolean = true,
  ) {
    return this.handleException.handle(async () =>
      this.progressModel.count({
        where: { completed, videoId: videoIds, userId },
      }),
    );
  }
}
