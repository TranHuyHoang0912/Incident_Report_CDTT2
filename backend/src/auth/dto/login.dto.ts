import { IsString, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @MinLength(3)
  @MaxLength(32)
  username: string;

  // @IsString()
  // @MinLength(6)
  // @MaxLength(64)
  // email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(64)
  password: string;
}
