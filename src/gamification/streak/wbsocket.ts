import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TokenService } from 'src/common/security/token';
import { StreakRepository } from './repo/streak.repo';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';

@WebSocketGateway({
  namespace: 'streak',
  cors: {
    origin: process.env.CLIENT_ORIGIN?.split(',') ?? false,
    credentials: true,
  },
})
export class StreakGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly tokenService: TokenService,
    private readonly streakRepository: StreakRepository,
    @InjectConnection() private readonly sequlize: Sequelize,
  ) {}
  @WebSocketServer() server!: Server;
  handleDisconnect(client: any) {
    throw new Error('Method not implemented.');
  }
  handleConnection(client: Socket) {
    const token = client.handshake.auth?.token;
    if (typeof token !== 'string') {
      client.disconnect();
      return;
    }

    const payload = this.tokenService.verify(token);
    const id = Number(payload?.id);

    client.data.userId = id;
  }

  @SubscribeMessage('get.streak')
  async handleGetStreak(client: Socket, @MessageBody() data: any) {
    return this.sequlize.transaction(async (transaction) => {
      const streak = await this.streakRepository.recordDailyActivity(
        client.data.userId,
        transaction,
      );
      client.emit(`streak:data:${client.data.userId}`, streak);
    });
  }
}
