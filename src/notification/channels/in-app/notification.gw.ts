import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { TokenService } from 'src/common/security/token';

@WebSocketGateway({
  cors: true,
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private tokenService: TokenService) {}

  @WebSocketServer() server!: Server;
  handleDisconnect(client: Socket) {}
  async handleConnection(client: Socket) {
    const token = client.handshake.auth.token;
    const {id} = await this.tokenService.verify(token, {
      secret: process.env.JWT_SECRET,
    });

    client.join(`user:${id}`);

    console.log(`user Connected`);
  }

  sendNotification(userId: number, notification: any) {
    this.server.to(`user:${userId}`).emit('notification' , notification);

  }
}
