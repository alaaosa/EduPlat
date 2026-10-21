import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
} from 'sequelize';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../../user/entities/user.entity';
import { Course } from 'src/learning/course/infrastructure/persistence/models/course.entity';
import { YEARS_OF_EXPERIENCE } from '../shared/enum';

@Table({
  tableName: 'instructers',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['instructerId'],
    },
  ],
})
export class Instructer extends Model<
  InferAttributes<Instructer>,
  InferCreationAttributes<Instructer>
> {
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    allowNull: false,
  })
  declare instructerId: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  })
  declare isInstructer: boolean;

  @BelongsTo(() => User, { as: 'user' })
  declare user: NonAttribute<User>;

  @Column({
    type: DataType.STRING,
  })
  declare stripeAccountId: CreationOptional<string>;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      isIn: [Object.values(YEARS_OF_EXPERIENCE)],
    },
  })
  declare yearsOfExperience: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare courseIdea: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare aboutMe: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare certification: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare linkedIn: string;

  @Column({
    type: DataType.STRING,
  })
  declare portfolio: CreationOptional<string>;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare videoUrl: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare videoId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare CV_Url: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare CV_Id: string;

  @HasMany(() => Course, {
    foreignKey: 'instructerId',
    sourceKey: 'instructerId',
    as: 'courses',
  })
  declare courses: NonAttribute<Course[]>;
}
