import { Module } from '@nestjs/common';
import { GroupModule } from './group/group.module';
import { PostModule } from './post/post.module';

@Module({
  controllers: [],
  providers: [],
  imports: [GroupModule, PostModule],
})
export class CommunityModule {}
