import { forwardRef, Module } from '@nestjs/common';
import { MuxService } from './mux.service';
import { MuxController } from './mux.controller';
import { LessonModule } from '../lesson/lesson.module';
import { CourseProgressModule } from '../learning/course/course-progress.module';
import Mux from '@mux/mux-node';

@Module({
  imports: [forwardRef(() => LessonModule), CourseProgressModule],
  controllers: [MuxController],
  providers: [
    MuxService,
    {
      provide: 'MUX_CLIENT',
      useFactory: () => {
        return new Mux({
          tokenId: process.env.MUX_TOKEN_ID!,
          tokenSecret: process.env.MUX_TOKEN_SECRET!,
        });
      },
    },
  ],
  exports: [MuxService],
})
export class MuxModule {}
