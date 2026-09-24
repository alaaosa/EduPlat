import { IsNumber, IsString } from 'class-validator';

export class SendNotificationDto {
  @IsNumber()
  userId!: number;

  @IsString()
  notification!: string;
}
