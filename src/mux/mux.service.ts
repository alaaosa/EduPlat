import Mux from '@mux/mux-node';
import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { VideoStatus } from './enum/video';
import { LessonRepository } from 'src/lesson/repo/lesson.repo';
import { CourseRepository } from 'src/learning/course/infrastructure/persistence/sequelize/course.repo';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { VideoHandler } from 'src/lesson/services/video.service';

@Injectable()
export class MuxService {
  private readonly logger = new Logger(MuxService.name);
  constructor(
    @Inject('MUX_CLIENT') private mux: Mux,
    @Inject(forwardRef(() => VideoHandler)) private videoService: VideoHandler,
    private lessonRepository: LessonRepository,
    private readonly courseRepository: CourseRepository,
    @InjectConnection() private sequlize: Sequelize,
  ) {}

  async createUploadUrl(instructerId: number, lessonId: number) {
    const lesson_details =
      await this.lessonRepository.getCourseIdByLessonId(lessonId);

    if (!lesson_details)
      throw new NotFoundException(`Course not found for lessonId`);
    const courseId = lesson_details.section.course.id;

    if (lesson_details.section.course.instructerId !== instructerId)
      throw new UnauthorizedException('not allowed ');

    const upload = await this.mux.video.uploads.create({
      new_asset_settings: {
        playback_policies: ['signed'],
        encoding_tier: 'baseline',
        passthrough: JSON.stringify({
          lessonId,
          courseId,
        }),
      },
      cors_origin: '*',
    });
    return upload;
  }

  async deleteAsset(assetId: string) {
    await this.mux.video.assets.delete(assetId);
  }

  async getAsset(assetId: string) {
    return this.mux.video.assets.retrieve(assetId);
  }

  generateSignedToken(playbackId: string) {
    const token = this.mux.jwt.signPlaybackId(playbackId, {
      keyId: process.env.MUX_SIGNING_KEY_ID,
      keySecret: process.env.MUX_PRIVATE_KEY,
      type: 'video',
      expiration: '1h',
    });
    return token;
  }

  async webHook(rawbody: Buffer, signature: string) {
    try {
      const event = await this.mux.webhooks.unwrap(
        rawbody.toString('utf8'),
        {
          'mux-signature': signature,
        },
        process.env.MUX_WEBHOOK_SECRET,
      );

      type WebhookHandler = (data: unknown) => Promise<void>;

      const status: Record<string, WebhookHandler> = {
        'video.asset.ready': this.assetReady.bind(this),
        'video.asset.errored': this.assetErrored.bind(this),
        'video.upload.cancelled': this.uploadCancelled.bind(this),
        // 'video.upload.asset_created': this.handleUploadAssetCreated.bind(this),
      };

      const handler = status[event.type];

      if (!handler) {
        this.logger.warn(`Unhandled event: ${event.type}`);
        return;
      }

      await handler(event.data);
    } catch (err) {
      this.logger.error('Failed to process Mux webhook', err);
      throw err;
    }
  }

  private async assetReady(asset: Mux.Video.Asset) {
    const { lessonId, courseId } = JSON.parse(asset.passthrough as string) as {
      lessonId: number;
      courseId: number;
    };

    if (!asset.playback_ids?.[0]?.id)
      throw new NotFoundException(`No playback ID found for asset ${asset.id}`);

    return this.sequlize.transaction(async (transaction) => {
      await this.videoService.create(
        {
          lessonId: lessonId,
          playbackId: asset.playback_ids![0].id,
          muxAssetId: asset.id,
          duration: Math.round(asset.duration ?? 0),
          status: VideoStatus.READY,
        },
        transaction,
      );

      await this.courseRepository.updateCourseDuration(
        courseId,
        Math.round(asset.duration ?? 0),
        transaction,
      );
    });
  }

  private async assetErrored(asset: any) {
    this.logger.error(asset.errors);
  }

  private async uploadCancelled(upload: any) {
    this.logger.warn(upload.id);
  }
}
