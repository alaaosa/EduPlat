import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { GroupGateway } from './chat.ws';
import { GroupRepository } from './repo/group.repo';
import { Group, GroupSchema } from './schema/group';
import { GroupMembership, GroupMembershipSchema } from './schema/user.group';
import {
  Conversation,
  ConversationSchema,
  Message,
  MessageSchema,
} from './schema/chat';
import { CommunicationAuthGuard } from '../../common/guard/communication-auth.guard';
import { CommunicationRealtimeService } from './communication-realtime.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Group.name, schema: GroupSchema },
      { name: GroupMembership.name, schema: GroupMembershipSchema },
      { name: Conversation.name, schema: ConversationSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
  ],
  controllers: [GroupController],
  providers: [
    GroupService,
    GroupRepository,
    GroupGateway,
    CommunicationAuthGuard,
    CommunicationRealtimeService,
  ],
})
export class GroupModule {}
