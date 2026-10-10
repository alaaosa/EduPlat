import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { HandleException } from 'src/db/db.service';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { UserSetting } from '../entities/user.setting';
import { CreationAttributes, Sequelize, Transaction } from 'sequelize';
import { UserState } from '../entities/user.states';

@Injectable()
export class UserRepository {
  constructor(
    private handleException: HandleException,
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(UserState) private readonly userStateModel: typeof UserState,
    @InjectConnection() private readonly sequelize: Sequelize,
  ) {}

  findById(id: number) {
    return this.handleException.handle(async () => {
      return this.userModel.findByPk(id);
    });
  }

  findNames(ids: number[]) {
    return this.handleException.handle(async () =>
      this.userModel.findAll({
        where: { id: ids },
        attributes: ['id', 'name'],
      }),
    );
  }

  create(
    user: Omit<CreationAttributes<User>, 'id'>,
    transaction?: Transaction,
  ) {
    return this.handleException.handle(async () => {
      return this.userModel.create(user, { transaction });
    });
  }

  findByEmail(email: string) {
    return this.handleException.handle(async () => {
      return this.userModel.findOne({ where: { email } });
    });
  }

  findSetting(id: number) {
    return this.handleException.handle(async () => {
      return this.userModel.findOne({
        where: { id },
        attributes: ['email'],
        include: {
          model: UserSetting,
          attributes: ['emailNotification', 'pushNotification'],
        },
      });
    });
  }

  changeIsActivited(userId: number, isActivited, transaction: Transaction) {
    return this.handleException.handle(async () => {
      return this.userModel.update(
        { isActivited },
        { where: { id: userId }, transaction },
      );
    });
  }

  incrementCourseCompleted(userId: number, transaction?: Transaction) {
    return this.handleException.handle(async () => {
      return this.userStateModel.increment(
        { courseCompleted: 1 },
        { where: { userId }, transaction },
      );
    });
  }

  updateUser(
    userId: number,
    data: Partial<Omit<CreationAttributes<User>, 'id'>>,
  ) {
    return this.handleException.handle(async () =>
      this.userModel.update(data, { where: { id: userId } }),
    );
  }

  updateUserPhoto(
    userId: number,
    data: { profilePictureId: string; profilePictureUrl: string },
  ) {
    return this.handleException.handle(async () =>
      this.userModel.update(data, { where: { id: userId } }),
    );
  }

  deleteUserPhoto(userId: number) {
    return this.handleException.handle(async () =>
      this.userModel.update(
        { profilePictureId: undefined, profilePictureUrl: undefined },
        { where: { id: userId } },
      ),
    );
  }

  findPublicId(userId: number) {
    return this.handleException.handle(async () =>
      this.userModel.findOne({
        where: { id: userId },
        attributes: ['profilePictureId'],
      }),
    );
  }

  updateUserPhotoUrl(userId: number, profilePictureUrl: string) {
    return this.handleException.handle(async () =>
      this.userModel.update({ profilePictureUrl }, { where: { id: userId } }),
    );
  }

  changeEmail(userId: number) {
    return this.handleException.handle(async () =>
      this.userModel.findByPk(userId, { attributes: ['id', 'email'] }),
    );
  }

  incrementCountOfCompletedCourse(id: number) {
    return this.handleException.handle(async () =>
      this.userStateModel.increment('courseCompleted', {
        by: 1,
        where: { id },
      }),
    );
  }

  updatePassword(userId: number, password: string) {
    return this.handleException.handle(async () =>
      this.userModel.update({ password }, { where: { id: userId } }),
    );
  }

 
  
}
