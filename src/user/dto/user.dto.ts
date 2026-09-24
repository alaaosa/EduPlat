import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

export class UserPhotoDTO {
  @IsString()
  url!: string;

  @IsString()
  public_id!: string;
}
export class UserDataDTO {
  @IsString()
  @IsNotEmpty({
    message: 'name empty , must input your name not any special char or spaces',
  })
  @MinLength(3, { message: 'min length of chars are 3' })
  name!: string;
}

export class UpdateUserEmail {
  @IsEmail({}, { message: 'not valid email' })
  email!: string;
}

export class createUserPhotoDTO {
  @Type(() => UserPhotoDTO)
  image!: UserPhotoDTO;
}
export class UpdateUserPhotoDTO {
  @Type(() => UserPhotoDTO)
  image!: UserPhotoDTO;
}

export class DeleteUserPhotoDTO extends UpdateUserPhotoDTO {}

export class ChangeEmailDTO {
  @IsEmail({}, { message: 'not valid email' })
  currentEmail!: string;
}

export class VerifyEmailDTO {
  @IsString({ message: 'string only' })
  @IsNotEmpty()
  @Length(6, 6, { message: 'length must be 6 numbers' })
  otp!: string;
}
