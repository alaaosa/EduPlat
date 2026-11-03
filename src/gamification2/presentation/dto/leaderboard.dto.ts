import { IsInt, IsPositive } from 'class-validator';

export class LeaderboardDTO {
  @IsPositive({ message: 'not valid Id' })
  userId!: number;
  @IsPositive({ message: 'not valid Id' })
  xp!: number;
}
