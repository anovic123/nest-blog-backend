import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';

import { SecurityRepository } from '../../../security/infra/security.repository';

export class LogoutUserCommand {
  constructor(public readonly deviceId: string) {}
}

@CommandHandler(LogoutUserCommand)
export class LogoutUserUseCase implements ICommandHandler<LogoutUserCommand> {
  constructor(private readonly securityRepository: SecurityRepository) {}

  async execute(command: LogoutUserCommand): Promise<boolean> {
    const { deviceId } = command;

    if (!deviceId) {
      throw new UnauthorizedException();
    }

    const device =
      await this.securityRepository.findSessionByDeviceId(deviceId);

    if (!device) {
      throw new UnauthorizedException();
    }

    const res = await this.securityRepository.deleteSecuritySession(deviceId);
    return res;
  }
}
