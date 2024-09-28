import { IsEmail, IsString } from 'class-validator';
import { Trim } from 'src/common/decorators';

export class EmailResendingModel {
  @IsString()
  @Trim()
  @IsEmail()
  email: string;
}
