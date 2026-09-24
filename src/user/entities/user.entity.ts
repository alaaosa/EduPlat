import {
  BelongsToMany,
  Column,
  DataType,
  HasMany,
  HasOne,
  Model,
  Table,
} from 'sequelize-typescript';
import { UserRoles } from 'src/common/enum';
import { UserSetting } from './user.setting';
import { OTP } from './otp.entity';
import { Enrollment } from 'src/course/enrollment/entities/enrollment.entity';
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
} from 'sequelize';
import { CouponUser } from 'src/course/coupon/entities/coupon.user';
import { Reward } from 'src/gamification/reward/entities/reward.entity';
import { UserBadge } from 'src/gamification/badge/entities/badge.user';
import { UserQuest } from 'src/gamification/quest/entities/user.quest';
import { Streak } from 'src/gamification/streak/entities/streak.entity';

@Table({
  tableName: 'users',
  timestamps: true,

  // defaultScope: {
  //   attributes: { exclude: ['password'] },
  // }, == > ignore password field when fetching user data
  // paranoid: true,// ==> This option enables soft deletes, meaning that when a record is deleted, it is not actually removed from the database but instead marked as deleted. This allows for recovery of deleted records if needed.
})
export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: CreationOptional<number>;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare publicId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare password: string;

  @Column({
    type: DataType.STRING,
    validate: {
      isIn: [Object.values(UserRoles)],
    },
    allowNull: false,
  })
  declare role: string;

  @Column({
    type: DataType.STRING,
  })
  declare profilePictureId: CreationOptional<string>;
  @Column({
    type: DataType.STRING,
  })
  declare profilePictureUrl: CreationOptional<string>;

  @Column({
    type: DataType.STRING,
  })
  declare bio: CreationOptional<string>;

  // @Column({
  //   type: DataType.STRING,
  // })
  // declare phone: string;

  // @Column({
  //   type: DataType.STRING,
  // })
  // declare Gender: string;

  // @Column({
  //   type: DataType.DATE,
  // })
  // declare dateOfBirth: Date;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare isActivited: CreationOptional<boolean>;

  ///////////////////
  @HasOne(() => UserSetting, { as: 'userSetting' })
  declare userSetting: NonAttribute<UserSetting>;
  @HasMany(() => OTP, { as: 'otps' })
  declare otp: NonAttribute<OTP>;
  @HasMany(() => Enrollment, { as: 'enrollments' })
  declare enrollments: NonAttribute<Enrollment[]>;
  @HasMany(() => CouponUser, { as: 'coupons' })
  declare coupons: NonAttribute<CouponUser[]>;
  @HasMany(() => Reward, { as: 'rewards' })
  declare rewards: NonAttribute<Reward[]>;
  @HasMany(() => UserBadge, { as: 'userBadges' })
  declare userBadges: NonAttribute<UserBadge[]>;
  @HasMany(() => UserQuest, { as: 'userQuests' })
  declare userQuests: NonAttribute<UserQuest[]>;
  @HasOne(() => Streak, { as: 'streak' })
  declare streak: NonAttribute<Streak>;
}
