import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { GroupPrivacy, WhoCanPost } from '../schema/group';
import { GroupRole } from '../schema/user.group';
import { Type } from 'class-transformer';

export class CreateGroupDto {
  @IsString() @IsNotEmpty() @MaxLength(120) name!: string;
  @IsString() @IsNotEmpty() @MaxLength(2000) description!: string;
  @IsOptional()
  @ValidateNested()
  @Type(() => GroupSettingsDto)
  settings?: GroupSettingsDto;
}
export class GroupSettingsDto {
  @IsOptional() @IsEnum(GroupPrivacy) privacy?: GroupPrivacy;
  @IsOptional() @IsEnum(WhoCanPost) whoCanPost?: WhoCanPost;
  @IsOptional() @IsBoolean() requirePostApproval?: boolean;
  @IsOptional() @IsBoolean() allowMemberInvites?: boolean;
  @IsOptional() @IsBoolean() showMemberCount?: boolean;
}
export class UpdateGroupDto {
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(120) name?: string;
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(2000) description?: string;
}
export class AddMembersDto {
  @IsArray() @IsInt({ each: true }) @Min(1, { each: true }) userIds!: number[];
}
export class ChangeRoleDto {
  @IsEnum(GroupRole) role!: GroupRole;
}
export class PrivateConversationDto {
  @IsInt() @Min(1) userId!: number;
}
export class PaginationDto {
  @IsOptional() @IsMongoId() before?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit = 30;
}
export class SendMessageDto {
  @IsString() @IsNotEmpty() @MaxLength(4000) message!: string;
}
export class SocketRoomDto {
  @IsMongoId() conversationId!: string;
}
export class GroupDto extends CreateGroupDto {}
export class chatsDTO {
  @IsInt() @Min(1) senderId!: number;
}
