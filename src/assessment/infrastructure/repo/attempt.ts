import { InjectModel } from '@nestjs/sequelize';
import { Attempt } from '../model/attempt';
import { CreationAttributes } from 'sequelize';
import { HandleException } from 'src/db/db.service';

export class AttemptRepository {
  constructor(
    private readonly handleException: HandleException,
    @InjectModel(Attempt) private readonly attemptModel: typeof Attempt,
  ) {}

  create(
    data: Omit<CreationAttributes<Attempt>, 'examId' | 'userId'>,
    userId: number,
    examId: number,
  ) {
    return this.handleException.handle(async () =>
      this.attemptModel.create({ ...data, userId, examId }),
    );
  }

  findAttemptDetails(attemptId: number) {
    return this.handleException.handle(async () =>
      this.attemptModel.findByPk(attemptId, {
        attributes: ['examId', 'startedAt', 'expiresAt'],
      }),
    );
  }
}
