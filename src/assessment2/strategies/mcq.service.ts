import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { mcq_tf_questionDto, choiceDto } from '../dto/mcq&tf';
import { examType, questionType } from '../models/MCQ&TF/question';
import { McqRepository } from '../repo/mcq.repo';
import { QuizRepo } from '../quiz/repo/quiz.repo';
import { Transaction } from 'sequelize';
import { FinalRepo } from '../final/repo/final.repo';

@Injectable()
export class McqService {
  constructor(
    private readonly mcqRepository: McqRepository,
    private readonly quizRepository: QuizRepo,
    private readonly finalRepository: FinalRepo,
  ) {}

  exam: Record<examType, (examId: number, transaction?: Transaction) => Promise<any>> = {
    [examType.QUIZ]: (examId, transaction) => this.quizRepository.findQuizById(examId, transaction),
    [examType.FINAL]: (examId, transaction) => this.finalRepository.findFinalById(examId, transaction),
  };

  /**
   * create MCQ/TF questions & answers for a specific exam
   */
  async createQuestions(
    questionData: mcq_tf_questionDto[],
    examId: number,
    examType: examType,
    transaction?: Transaction,
  ) {
    // enshure that because you make transaction on finalservice
    const exam = await this.exam[examType](examId, transaction);
    if (!exam) throw new NotFoundException('exam not found');
    this.validate_MCQ_TF_Answers(questionData);

    const questions = await this.mcqRepository.createQuestion(
      questionData,
      examId,
      examType,
      transaction,
    );

    const answers = questionData.flatMap((question, index) =>
      question.answers.map((answer) => ({
        ...answer,
        questionId: questions[index].id,
      })),
    );

    await this.mcqRepository.createAnswer(answers, transaction);
  }

  private validate_MCQ_TF_Answers(questions: mcq_tf_questionDto[]) {
    for (const question of questions) {
      const correctAnswers = question.answers.reduce(
        (acc, answer) => acc + (answer.isCorrect ? 1 : 0),
        0,
      );

      switch (question.questionType) {
        case questionType.TF:
          if (question.answers.length !== 2 || correctAnswers !== 1) {
            throw new BadRequestException(
              'True/False questions must contain exactly 2 answers with only 1 correct answer.',
            );
          }
          break;

        case questionType.MCQ:
          if (question.answers.length < 4 || correctAnswers !== 1) {
            throw new BadRequestException(
              'MCQ questions must contain at least 4 answers with only 1 correct answer.',
            );
          }
          break;

        default:
          throw new BadRequestException('Invalid question type.');
      }
    }
  }

  /**
   *
   * @param studentAnswers
   * @param examAnswers
   * @returns the percentage score of the user
   * not related to quiz or final exam. just evaluate the questions and return the score , total questions and correct answers
   */

  grade(studentAnswers: choiceDto[], examAnswers: choiceDto[]) {
    let score = 0;
    let totalQuestions = examAnswers.length;
    let correctAnswers = 0;
    const examMap = new Map<number, number>(
      examAnswers.map((answer) => [answer.questionId, answer.answerId]),
    );

    // const examQuestionIds = [...examMap.keys()];

    for (const studentAnswer of studentAnswers) {
      // if (!examQuestionIds.includes(studentAnswer.questionId))

      const correctAnswerId = examMap.get(studentAnswer.questionId);
      if (correctAnswerId === undefined) 
        throw new NotFoundException(
          'there is a qustion or alot not included this exam',
        );
      
      if (studentAnswer.answerId === correctAnswerId) {
        correctAnswers++;
      }
    }

    score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    return {
      score,
      totalQuestions,
      correctAnswers,
    };
  }
}
