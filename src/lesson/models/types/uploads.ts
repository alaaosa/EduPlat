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
  Model,
  Table,
} from 'sequelize-typescript';
import { VideoStatus } from 'src/mux/enum/video';
import { Lesson } from '../lesson.model';

@Table({
  tableName: 'uploads',
  timestamps: true,
  indexes:[
    {
        fields:['lessonId']
    }
  ]
})
export class Upload extends Model<
  InferAttributes<Upload>,
  InferCreationAttributes<Upload>
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
    unique: true,
  })
  declare uploadId: string;

  @Column({
    type: DataType.STRING,
    validate: {
      isIn: [Object.values(VideoStatus)],
    },
    allowNull: false,
  })
  declare status: VideoStatus;

  @ForeignKey(() => Lesson)
  @Column({
    type: DataType.INTEGER,
    unique: true,
    allowNull: false,
  })
  declare lessonId: number;

  @BelongsTo(() => Lesson, { as: 'lesson', foreignKey: 'lessonId' })
  declare lesson: NonAttribute<Lesson>;
}
