import { Injectable } from '@nestjs/common';
import { GradeRepository } from '../infrastructure/repo/grade';
import { StudentAnswerDTO } from '../presentation/dto/student-answer';

@Injectable()
export class GradeService {
  constructor(private readonly gradeRepo: GradeRepository) {}

  async saveStudentAnswer(dto: StudentAnswerDTO, userId: number) {
    await this.gradeRepo.saveStudentAnswer(
      { questionId: dto.questionId, studentAnswerId: dto.answerId },
      userId,
    );
  }
}
