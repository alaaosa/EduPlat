import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class VideoDto {
  @IsNumber()
  lessonId!: number;
  @IsString()
  @IsNotEmpty()
  muxAssetId!: string;

  @IsString()
  @IsNotEmpty()
  playbackId!: string;

  @IsNumber()
  @IsPositive()
  declare duration: number;


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
