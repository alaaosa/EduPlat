import { Module } from '@nestjs/common';
import { GroupModule } from './group/group.module';

@Module({
  controllers: [],
  providers: [],
  imports: [GroupModule],
})
export class CommunityModule {}
