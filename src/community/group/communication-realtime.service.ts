import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class CommunicationRealtimeService {
  private server?: Server;
  attach(server: Server) {
    this.server = server;
  }
  message(conversationId: string, payload: unknown) {
    this.server
      ?.to(`conversation:${conversationId}`)
      .emit('message.created', payload);
  }
}
 