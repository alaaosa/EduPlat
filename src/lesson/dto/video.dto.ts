import { IsBoolean, IsInt, IsNumber, IsString } from 'class-validator';
import { LessonType } from '../shared/enum/lesson.type';

export class VideoDto {
  @IsNumber()
  lessonId!: number;
  @IsString()
  muxAssetId!: string;

  @IsString()
  playbackId!: string;

  @IsNumber()
  declare duration: number;

  @IsString()
  declare status: string;
}
export class CreateVideoDto {
  @IsNumber()
  lessonId!: number;
}

export class CalculateProgressDto {
  @IsNumber()
  @IsInt()
  progress!: number;

  @IsBoolean()
  completed!: boolean;
}
