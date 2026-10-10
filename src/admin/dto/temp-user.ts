import { IsEmail, IsEnum } from 'class-validator';
import { UserRoles } from 'src/common/enum';

export class TempUserDTO {
  @IsEmail()
  email!: string;

  @IsEnum(UserRoles)
  role!: UserRoles;
}
