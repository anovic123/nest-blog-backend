import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersQueryRepository } from 'src/features/users/infra/users-query.repository';
import { UsersRepository } from 'src/features/users/infra/users.repository';

import { AuthRepository } from '../infra/auth-repository';

import { CryptoService } from 'src/core/adapters/crypto-service';

import { EmailsManager } from 'src/core/adapters/email.manager';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly cryptoService: CryptoService,
    private readonly authRepository: AuthRepository,
    private readonly emailsManager: EmailsManager,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  public async checkCredentials(
    loginOrEmail: string,
    password: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const user =
      await this.usersQueryRepository.findUserByLoginOrEmail(loginOrEmail);

    if (!user) {
      throw new HttpException('User is not founded', HttpStatus.UNAUTHORIZED);
    }

    const isHashedEquals = await this.cryptoService.compareHash(
      password,
      user.accountData.passwordHash,
    );

    if (!isHashedEquals) {
      throw new HttpException('Password is wrong', HttpStatus.UNAUTHORIZED);
    }

    const userId = user._id.toString();

    const accessToken = this.jwtService.sign({ userId });

    const refreshToken = this.jwtService.sign({
      userId,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
