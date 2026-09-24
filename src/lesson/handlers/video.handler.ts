import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AbstractLesson } from './main';
import {
  CalculateProgressDto,
  CreateVideoDto,
  VideoDto,
} from '../dto/video.dto';
import { VideoRepository } from '../repo/video.repo';
import { Sequelize, Transaction } from 'sequelize';
import { MuxService } from 'src/mux/mux.service';
import { InjectConnection } from '@nestjs/sequelize';

@Injectable()
export class VideoHandler {
  constructor(
    private videoRepository: VideoRepository,
    private readonly muxService: MuxService,
    @InjectConnection() private readonly sequelize: Sequelize,
  ) {}

  async create(dto: VideoDto, transaction?: Transaction) {
    const video = await this.videoRepository.create(dto, transaction);
    return video;
  }

  async createUrl(lessonId: number) {
    const url = await this.muxService.createUploadUrl(lessonId);
    if (!url) throw new Error('Failed to create upload URL');
    return url;
  }

  // calc the progress of the course based on the video completion
  async createVideoByLessonId(
    videoId: number,
    userId: number,
    dto: CalculateProgressDto,
  ) {
    return this.sequelize.transaction(async (transaction) => {
      const video = await this.videoRepository.createOrUpdateLessonUserProgress(
        dto.progress,
        videoId,
        userId,
        transaction,
      );
      if (!video) throw new Error('Video not found');
      return video;
    });
  }

  //get the current progress of the video for the user
  async getVideoProgress(videoId: number, userId: number) {
    const video = await this.videoRepository.findVideoProgressByUserId(
      videoId,
      userId,
    );
    if (!video) throw new Error('Video not found');
    return video;
  }

  async getLessonVideoPlayBackUrl(
    lessonId: number,
    userId: number,
  ): Promise<{
    url: string;
    duration: number;
    videoId: number;
    states: { progress: number; completed: boolean } | null;
  }> {
    const video = await this.videoRepository.getLessonVideo(lessonId, userId);

    if (!video) throw new BadRequestException('video not found');

    const token = await this.muxService.generateSignedToken(video.playbackId);

    const playbackUrl = `https://stream.mux.com/${video.playbackId}.m3u8?token=${token}`;

    return {
      url: playbackUrl,
      duration: video.duration,
      videoId: video.id,
      states: video.progress
        ? {
            progress: video.progress.progress,
            completed: video.progress.completed,
          }
        : null,
    };
  }
}
