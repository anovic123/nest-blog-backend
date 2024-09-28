import { IsString, Length } from 'class-validator';
import { Trim } from 'src/common/decorators';

export class NewPasswordInputModel {
  @IsString()
  @Trim()
  @Length(6, 20)
  newPassword: string;
  @IsString()
  @Trim()
  recoveryCode: string;
}
