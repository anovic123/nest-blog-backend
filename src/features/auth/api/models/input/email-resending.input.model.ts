import { IsEmail, IsString } from 'class-validator';
import { EmailIsExist, Trim } from 'src/common/decorators';

export class EmailResendingModel {
  @IsString()
  @Trim()
  @IsEmail()
  @EmailIsExist()
  email: string;
}
