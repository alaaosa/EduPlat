import { Module } from '@nestjs/common';
import { FinalService } from './final.service';
import { FinalController } from './final.controller';
import { AssessmentModule } from '../assessment.module';

@Module({
  imports: [AssessmentModule],
  controllers: [FinalController],
  providers: [FinalService],
  exports: [FinalService, AssessmentModule],
})
export class FinalModule {}
