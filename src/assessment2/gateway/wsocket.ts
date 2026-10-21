import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TokenService } from 'src/common/security/token';
import { choiceDto } from '../dto/mcq&tf';
import { AssessmentService } from '../assessment.service';
import { AttemptRepository } from '../repo/attempt.repo';
import { IsInt } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { AttemptStatus } from '../shared/enum/attempt';

class SubmitAssessmentDto {
  @IsInt()
  attemptId!: number;
}

@WebSocketGateway({ namespace: 'assessment', cors: { origin: '*' } })
export class AssessmentGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly tokenService: TokenService,
    private readonly assessmentService: AssessmentService,
    private readonly attemptsRepo: AttemptRepository,
  ) {}

  @WebSocketServer() server!: Server;

  async handleConnection(client: Socket) {
    try {
      const attemptId = Number(client.handshake.query.attemptId);
      if (!Number.isInteger(attemptId) || attemptId <= 0) {
        throw new Error('Missing or invalid attempt id');
      }

      const token = client.handshake.auth.token;
      if (!token) throw new Error('Missing token');
      const { id, name } = await this.tokenService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      if (!id) throw new Error('Invalid token');

      const attempt = await this.attemptsRepo.findByUserIdAndAttemptId(attemptId, id);
      if (!attempt || attempt.status !== AttemptStatus.IN_PROGRESS) {
        throw new Error('Attempt is not active');
      }
      if (attempt.expiresAt <= new Date()) {
        await this.assessmentService.expireAttempt(
          attempt.id,
          attempt.assessmentId,
          { id, name },
          attempt.examType,
        );
        throw new Error('Attempt has expired');
      }

      client.data.user = { id, name };
      client.data.attemptId = attempt.id;
      client.data.assessmentId = attempt.assessmentId;
      client.data.type = attempt.examType;
      client.join(`attempt:${attempt.id}`);
    } catch {
      client.disconnect(true);
    }
  }

  async handleDisconnect(_client: Socket) {
    // Connection presence is intentionally not exam state. Reconnect is always allowed
    // while SQL Server reports this attempt as active.
  }

  @SubscribeMessage('save-answer')
  async handleSaveAnswer(
    @MessageBody() rawData: unknown,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const data = plainToInstance(choiceDto, rawData);
      await validateOrReject(data, { whitelist: true, forbidNonWhitelisted: true });
      const result = await this.assessmentService.saveAnswer(
        client.data.attemptId,
        client.data.user.id,
        data,
      );
      client.emit('answer-saved', { questionId: data.questionId, ...result });
      return result;
    } catch (error) {
      throw new WsException(error instanceof Error ? error.message : 'Could not save answer');
    }
  }

  @SubscribeMessage('submit-assessment')
  async handleSubmit(
    @ConnectedSocket() client: Socket,
    @MessageBody() rawData: unknown,
  ) {
    try {
      const data = plainToInstance(SubmitAssessmentDto, rawData);
      await validateOrReject(data, { whitelist: true, forbidNonWhitelisted: true });
      if (data.attemptId !== client.data.attemptId) {
        throw new WsException('Attempt does not match this connection');
      }

      const result = await this.assessmentService.submitAssessment(
        client.data.assessmentId,
        client.data.attemptId,
        client.data.user,
        client.data.type,
      );
      client.emit('assessment-submitted', { success: true, result });
      this.server.to(`attempt:${client.data.attemptId}`).emit('assessment-finished', result);
      this.server.in(`attempt:${client.data.attemptId}`).disconnectSockets(true);
      return result;
    } catch (error) {
      throw new WsException(error instanceof Error ? error.message : 'Submission failed');
    }
  }

  @SubscribeMessage('get-assessment-result')
  async handleGetResult(@ConnectedSocket() client: Socket) {
    return this.assessmentService.getResult(
      client.data.assessmentId,
      client.data.type,
      client.data.user.id,
    );
  }
}
