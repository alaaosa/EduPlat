import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum GroupPrivacy {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}
export enum WhoCanPost {
  ALL_MEMBERS = 'ALL_MEMBERS',
  ADMINS_ONLY = 'ADMINS_ONLY',
}

@Schema({ _id: false })
export class GroupSettings {
  @Prop({ enum: GroupPrivacy, default: GroupPrivacy.PRIVATE })
  privacy!: GroupPrivacy;
  @Prop({ enum: WhoCanPost, default: WhoCanPost.ALL_MEMBERS })
  whoCanPost!: WhoCanPost;
  @Prop({ default: false }) requirePostApproval!: boolean;
  @Prop({ default: false }) allowMemberInvites!: boolean;
  @Prop({ default: true }) showMemberCount!: boolean;
}
export const GroupSettingsSchema = SchemaFactory.createForClass(GroupSettings);

@Schema({ timestamps: true })
export class Group {
  @Prop({ required: true, trim: true, maxlength: 120 }) name!: string;
  @Prop({ required: true, trim: true, maxlength: 2000 }) description!: string;
  @Prop({ required: true, index: true }) ownerId!: number;
  @Prop({ type: GroupSettingsSchema, default: () => ({}) })
  settings!: GroupSettings;
}
export type GroupDocument = HydratedDocument<Group>;
export const GroupSchema = SchemaFactory.createForClass(Group);
GroupSchema.index({ ownerId: 1, createdAt: -1 });
