import { IsString, MinLength, MaxLength, IsIn } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(32)
  username: string;

  @IsString()
  @MinLength(3)
  @MaxLength(32)
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(64)
  password: string;

  @IsString()
  @IsIn(['ADMIN', 'STAFF', 'USER']) // phải thuộc 1 trong 3 giá trị này
  role: string;
}
