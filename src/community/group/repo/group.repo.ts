import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Group } from '../schema/group';
import { GroupMembership } from '../schema/user.group';
import { Conversation, Message } from '../schema/chat';
@Injectable()
export class GroupRepository {
  constructor(
    @InjectModel(Group.name) readonly groups: Model<Group>,
    @InjectModel(GroupMembership.name)
    readonly memberships: Model<GroupMembership>,
    @InjectModel(Conversation.name) readonly conversations: Model<Conversation>,
    @InjectModel(Message.name) readonly messages: Model<Message>,
  ) {}
  objectId(value: string) {
    return new Types.ObjectId(value);
  }

  async findGroupNamesByUserId(userId: number): Promise<{ name: string }[]> {
    const memberships = await this.memberships
      .find({ userId })
      .select('groupId -_id')
      .lean()
      .exec();
    const groupIds = memberships.map(({ groupId }) => groupId);

    if (groupIds.length === 0) return [];

    const groups = await this.groups
      .find({ _id: { $in: groupIds } })
      .select('name -_id')
      .lean()
      .exec();

    return groups.map(({ name }) => ({ name }));
  }
}
