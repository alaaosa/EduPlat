import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WsException,
} from '@nestjs/websockets';
import { plainToInstance } from 'class-transformer';
import { Socket } from 'socket.io';
import { StudentAnswerDTO } from '../dto/student-answer';
import { validateOrReject, ValidationTypes } from 'class-validator';
import { TokenService } from 'src/common/security/token';
import { AttemptService } from 'src/assessment/application/attempt.service';
import { GradeService } from 'src/assessment/application/grade.service';

@WebSocketGateway()
export class HandleStudentAnswer
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly tokenService: TokenService,
    private readonly attemptService: AttemptService,
    private readonly gradeService: GradeService,
  ) {}
  handleDisconnect(client: any) {
    throw new Error('Method not implemented.');
  }
  handleConnection(client: Socket) {
    const user = this.tokenService.verify(client.handshake.auth.token);

    if (!user) throw new WsException('user not found');

    client.data.details;

    client.data.user = user;
  }
  @SubscribeMessage('submit-answer')
  async submit(
    @MessageBody() data: StudentAnswerDTO,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.user.id as number;
    // const dto = plainToInstance(StudentAnswerDTO, data);
    // await validateOrReject(dto, {
    //   whitelist: true,
    //   forbidNonWhitelisted: true,
    // }).catch((err) => {
    //   throw new WsException({ message: 'exist error on data', err });
    // });

    await this.attemptService.checkAttempt(data.attemptId, new Date());
    await this.gradeService.saveStudentAnswer(data, userId);
  }
}
