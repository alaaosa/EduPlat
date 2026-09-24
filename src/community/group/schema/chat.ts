import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Group } from './group';

export enum ConversationType {
  PRIVATE = 'PRIVATE',
  GROUP = 'GROUP',
}
export enum MessageStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ required: true, enum: ConversationType, index: true })
  type!: ConversationType;
  @Prop({ type: [Number], default: [] }) participantIds!: number[];
  @Prop({ sparse: true }) privateKey?: string;
  @Prop({ type: Types.ObjectId, ref: Group.name, sparse: true, unique: true })
  groupId?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, default: null })
  lastMessageId?: Types.ObjectId | null;
  @Prop({ type: Date, default: null, index: true }) lastMessageAt?: Date | null;
}
export type ConversationDocument = HydratedDocument<Conversation>;
export const ConversationSchema = SchemaFactory.createForClass(Conversation);
ConversationSchema.index(
  { privateKey: 1 },
  { unique: true, partialFilterExpression: { type: ConversationType.PRIVATE } },
);
ConversationSchema.index({ participantIds: 1, lastMessageAt: -1 });

@Schema({ timestamps: true })
export class Message {
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: Conversation.name,
    index: true,
  })
  conversationId!: Types.ObjectId;
  @Prop({ required: true, index: true }) senderId!: number;
  @Prop({ required: true, trim: true, maxlength: 4000 })
  message!: string;
  @Prop({
    required: true,
    enum: MessageStatus,
    default: MessageStatus.APPROVED,
    index: true,
  })
  status!: MessageStatus;
}
export type MessageDocument = HydratedDocument<Message>;
export const MessageSchema = SchemaFactory.createForClass(Message);
MessageSchema.index({ conversationId: 1, createdAt: -1, _id: -1 });
export { Message as Chat, MessageSchema as chatSchema };
