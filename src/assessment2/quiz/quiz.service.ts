import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { examType } from '../models/MCQ&TF/question';
import { McqService } from '../strategies/mcq.service';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize, UniqueConstraintError } from 'sequelize';
import { QuizRepo } from './repo/quiz.repo';
import { CreateQuizDto } from './dto/create-quiz.dto';

@Injectable()
export class QuizService {
  constructor(
    @InjectConnection() private sequlize: Sequelize,
    private readonly mcq_tf_Service: McqService,
    private readonly quizRepo: QuizRepo,
  ) {}

  async create(dto: CreateQuizDto) {
    if (dto.mcq_tf_questions.length === 0) {
      throw new BadRequestException('Quiz must include at least one question');
    }

    return this.sequlize.transaction(async (transaction) => {
      try {
        const quiz = await this.quizRepo.create(
          { lessonId: dto.lessonId, duration: dto.duration },
          transaction,
        );
        await this.mcq_tf_Service.createQuestions(
          dto.mcq_tf_questions,
          quiz.id,
          examType.QUIZ,
          transaction,
        );

        return quiz;
      } catch (error) {
        if (error instanceof UniqueConstraintError) {
          throw new ConflictException('A quiz already exists for this lesson');
        }
        throw error;
      }
    });
  }

  async findById(quizId: number) {
    const quiz = await this.quizRepo.findConfigurationById(quizId);
    if (!quiz) throw new NotFoundException('Quiz not found');
    return quiz;
  }

  // get quiz configuration by lessonId and get the attempt info if the user has attempted the quiz or not
  async findByLessonId(lessonId: number, userId: number) {
    const quiz = await this.quizRepo.findConfigurationByLessonId(
      lessonId,
      userId,
    );
    if (!quiz) throw new NotFoundException('Quiz not found for this lesson');

    if (quiz.attempts.length > 0) {
      return {
        message: 'You have already attempted this quiz',
        score: quiz.attempts[0].studentScore,
      };
    }

    return quiz;
  }
}
