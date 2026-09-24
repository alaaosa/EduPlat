import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { AssessmentModule } from '../assessment.module';

@Module({
  imports: [AssessmentModule],
  controllers: [QuizController],
  providers: [QuizService],
  exports: [QuizService],
})
export class QuizModule {}
