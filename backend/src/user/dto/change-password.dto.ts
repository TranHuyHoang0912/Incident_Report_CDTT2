import { IsString, MinLength, MaxLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @MinLength(6)
  @MaxLength(64)
  oldPassword: string;

  @IsString()
  @MinLength(6)
  @MaxLength(64)
  newPassword: string;
}
