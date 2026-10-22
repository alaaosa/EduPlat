import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { CalculateProgressDto, VideoDto } from '../dto/video.dto';
import { VideoRepository } from '../repo/video.repo';
import { Sequelize, Transaction } from 'sequelize';
import { MuxService } from 'src/mux/mux.service';
import { InjectConnection } from '@nestjs/sequelize';

@Injectable()
export class VideoHandler {
  constructor(
    private videoRepository: VideoRepository,
    @Inject(forwardRef(() => MuxService)) private readonly muxService: MuxService,
    @InjectConnection() private readonly sequelize: Sequelize,
  ) {}

  async create(dto: VideoDto, transaction?: Transaction) {
    const video = await this.videoRepository.create(dto, transaction);
    return video;
  }

  async createUrl(instructerId: number, lessonId: number) {
    const url = await this.muxService.createUploadUrl(instructerId, lessonId);
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
    playbackId: string;
    duration: number;
    token: string;
    states: { progress: number; completed: boolean } | null;
  }> {
    const video = await this.videoRepository.getLessonVideo(lessonId, userId);

    if (!video) throw new BadRequestException('video not found');

    const token = await this.muxService.generateSignedToken(video.playbackId);

    return {
      playbackId: video.playbackId,
      duration: video.duration,
      token,
      states: video.progress
        ? {
            progress: video.progress.progress,
            completed: video.progress.completed,
          }
        : null,
    };
  }
}
