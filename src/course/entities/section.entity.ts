import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Course } from './course.entity';
import { Lesson } from 'src/lesson/models/lesson.model';
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
} from 'sequelize';

@Table({
  tableName: 'sections',
  indexes: [
    {
      fields: ['courseId'],
    },
  ],
  timestamps: true,
})
export class Section extends Model<
  InferAttributes<Section>,
  InferCreationAttributes<Section>
> {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    type: DataType.INTEGER,
  })
  declare id: CreationOptional<number>;

  @Column({
    type: DataType.STRING,
  })
  declare title: string;

  @Column({
    type: DataType.STRING,
  })
  declare description: string | null;

  @BelongsTo(() => Course, {
    as: 'course',
    foreignKey: 'courseId',
    onDelete: 'CASCADE',
  })
  declare course: NonAttribute<Course>;

  @ForeignKey(() => Course)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare courseId: number;

  @HasMany(() => Lesson , {as : 'lessons'})
  declare lessons: NonAttribute<Lesson[]>;
}
