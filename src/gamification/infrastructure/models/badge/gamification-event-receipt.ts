import { BadgeEventType } from '../../../domain/shared/enum/badge.enums';
import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'gamification_event_receipts', timestamps: false })
export class GamificationEventReceipt extends Model {
  @Column({
    type: DataType.STRING(64),
    primaryKey: true,
    allowNull: false,
  })
  declare idempotency_key: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare userId: number;

  @Column({ type: DataType.STRING, allowNull: false })
  declare eventType: BadgeEventType;
}
