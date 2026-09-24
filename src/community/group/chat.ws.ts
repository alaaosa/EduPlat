import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TokenService } from 'src/common/security/token';
import { BadRequestException } from '@nestjs/common';
import { GroupService } from './group.service';
import { SendMessageDto, SocketRoomDto } from './dto/group.dto';
import { MessageStatus } from './schema/chat';
import { CommunicationRealtimeService } from './communication-realtime.service';

@WebSocketGateway({
  namespace: 'communication',
  cors: {
    origin: process.env.CLIENT_ORIGIN?.split(',') ?? false,
    credentials: true,
  },
})
export class GroupGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly tokenService: TokenService,
    private readonly groups: GroupService,
    private readonly realtime: CommunicationRealtimeService,
  ) {}
  @WebSocketServer() set server(value: Server) {
    this.realtime.attach(value);
  }
  handleDisconnect(client: Socket) {}
  async handleConnection(client: Socket) {
    const token = client.handshake.auth?.token;
    if (typeof token !== 'string') return client.disconnect(true);
    try {
      const payload = await this.tokenService.verify(token);
      const id = Number(payload?.id ?? payload?.sub);
      if (!Number.isSafeInteger(id) || id < 1) throw new Error('invalid user');
      client.data.userId = id;
    } catch {
      client.disconnect(true);
    }
  }

  private user(client: Socket) {
    const id = client.data.userId;
    if (!id) throw new BadRequestException('Unauthenticated socket');
    return id as number;
  }
  @SubscribeMessage('conversation.join') async join(
    @MessageBody() data: SocketRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    const conversation = await this.groups.getConversation(
      this.user(client),
      data.conversationId,
    );
    await client.join(`conversation:${conversation._id}`);
    return { conversationId: conversation._id.toString() };
  }
  @SubscribeMessage('conversation.leave') async leave(
    @MessageBody() data: SocketRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    await this.groups.getConversation(this.user(client), data.conversationId);
    await client.leave(`conversation:${data.conversationId}`);
    return { left: true };
  }
  @SubscribeMessage('message.send') async send(
    @MessageBody() data: SocketRoomDto & SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.groups.sendMessage(
      this.user(client),
      data.conversationId,
      { message: data.message },
    );
    if (message.status === MessageStatus.APPROVED)
      this.realtime.message(
        message.conversationId.toString(),
        message.toJSON(),
      );
    return message;
  }
}
