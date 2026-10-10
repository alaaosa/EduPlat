import type{ CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'outbox_emails',
  timestamps: true,
})
export class OutboxEmail extends Model<
  InferAttributes<OutboxEmail>,
  InferCreationAttributes<OutboxEmail>
> {

    @Column({
        type: DataType.INTEGER,
        autoIncrement : true,
        primaryKey: true,
    })
    declare id: CreationOptional<number>;

    
}
