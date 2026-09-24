import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Group } from './group';

export enum GroupRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}
@Schema({ timestamps: true })
export class GroupMembership {
  @Prop({ required: true, type: Number })
  userId!: number;

  @Prop({ required: true, type: Types.ObjectId, ref: Group.name })
  groupId!: Types.ObjectId;

  @Prop({ required: true, enum: GroupRole, default: GroupRole.MEMBER })
  role!: GroupRole;
}

export type GroupMembershipDocument = HydratedDocument<GroupMembership>;
export const GroupMembershipSchema =
  SchemaFactory.createForClass(GroupMembership);
GroupMembershipSchema.index({ groupId: 1, userId: 1 }, { unique: true });
export {
  GroupMembership as UserGroup,
  GroupMembershipSchema as UserGroupSchema,
};
