import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { UserRoles } from 'src/common/enum';

@Table({
  tableName: 'temp_users',
  timestamps: true,
})
export class TempUser extends Model<
  InferAttributes<TempUser>,
  InferCreationAttributes<TempUser>
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
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      isIn: [Object.values(UserRoles)],
    },
  })
  declare role: UserRoles;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  declare email_sended: boolean;
}
