import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { GroupService } from './group.service';
import {
  AddMembersDto,
  ChangeRoleDto,
  CreateGroupDto,
  GroupSettingsDto,
  PaginationDto,
  PrivateConversationDto,
  SendMessageDto,
  UpdateGroupDto,
} from './dto/group.dto';
import { CommunicationAuthGuard } from '../../common/guard/communication-auth.guard';

@Controller('group')
@UseGuards(CommunicationAuthGuard)
export class GroupController {
  constructor(private readonly groupService: GroupService) {}
  @Post() create(@Req() req: any, @Body() dto: CreateGroupDto) {
    return this.groupService.createGroup(dto, req.user.id);
  }
  @Get('conversations') conversations(@Req() req: any) {
    return this.groupService.listConversations(req.user.id);
  }
  @Post('conversations/private') privateConversation(
    @Req() req: any,
    @Body() dto: PrivateConversationDto,
  ) {
    return this.groupService.getOrCreatePrivateConversation(
      req.user.id,
      dto.userId,
    );
  }
  @Get('conversations/:conversationId') conversation(
    @Req() req: any,
    @Param('conversationId') id: string,
  ) {
    return this.groupService.getConversation(req.user.id, id);
  }
  @Get('conversations/:conversationId/messages') messages(
    @Req() req: any,
    @Param('conversationId') id: string,
    @Query() page: PaginationDto,
  ) {
    return this.groupService.messages(req.user.id, id, page);
  }
  @Post('conversations/:conversationId/messages') sendMessage(
    @Req() req: any,
    @Param('conversationId') id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.groupService.sendMessage(req.user.id, id, dto);
  }
  @Get(':groupId') group(@Req() req: any, @Param('groupId') id: string) {
    return this.groupService.getGroup(req.user.id, id);
  }
  @Patch(':groupId') update(
    @Req() req: any,
    @Param('groupId') id: string,
    @Body() dto: UpdateGroupDto,
  ) {
    return this.groupService.updateGroup(req.user.id, id, dto);
  }
  @Post(':groupId/join') join(@Req() req: any, @Param('groupId') id: string) {
    return this.groupService.joinPublicGroup(req.user.id, id);
  }
  @Patch(':groupId/settings') settings(
    @Req() req: any,
    @Param('groupId') id: string,
    @Body() dto: GroupSettingsDto,
  ) {
    return this.groupService.updateSettings(req.user.id, id, dto);
  }
  @Get(':groupId/members') members(
    @Req() req: any,
    @Param('groupId') id: string,
  ) {
    return this.groupService.getMembers(req.user.id, id);
  }
  @Post(':groupId/members') addMembers(
    @Req() req: any,
    @Param('groupId') id: string,
    @Body() dto: AddMembersDto,
  ) {
    return this.groupService.addMembers(req.user.id, id, dto);
  }
  @Delete(':groupId/members/:userId') removeMember(
    @Req() req: any,
    @Param('groupId') id: string,
    @Param('userId') target: string,
  ) {
    return this.groupService.removeMember(req.user.id, id, Number(target));
  }
  @Delete(':groupId/members/me') leave(
    @Req() req: any,
    @Param('groupId') id: string,
  ) {
    return this.groupService.leaveGroup(req.user.id, id);
  }
  @Patch(':groupId/members/:userId/role') role(
    @Req() req: any,
    @Param('groupId') id: string,
    @Param('userId') target: string,
    @Body() dto: ChangeRoleDto,
  ) {
    return this.groupService.changeRole(
      req.user.id,
      id,
      Number(target),
      dto.role,
    );
  }
  @Get(':groupId/messages/pending') pending(
    @Req() req: any,
    @Param('groupId') id: string,
    @Query() page: PaginationDto,
  ) {
    return this.groupService.pendingMessages(req.user.id, id, page);
  }
  @Post(':groupId/messages/:messageId/approve') approve(
    @Req() req: any,
    @Param('groupId') groupId: string,
    @Param('messageId') messageId: string,
  ) {
    return this.groupService.reviewMessage(
      req.user.id,
      groupId,
      messageId,
      true,
    );
  }
  @Post(':groupId/messages/:messageId/reject') reject(
    @Req() req: any,
    @Param('groupId') groupId: string,
    @Param('messageId') messageId: string,
  ) {
    return this.groupService.reviewMessage(
      req.user.id,
      groupId,
      messageId,
      false,
    );
  }
  @Delete(':groupId') delete(@Req() req: any, @Param('groupId') id: string) {
    return this.groupService.deleteGroup(req.user.id, id);
  }
}
