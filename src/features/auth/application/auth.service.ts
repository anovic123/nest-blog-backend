import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { UsersQueryRepository } from 'src/features/users/infra/users-query.repository';

import { CryptoService } from 'src/core/adapters/crypto-service';

import { JwtService } from '../../../core/adapters/jwt-service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly cryptoService: CryptoService,
    private readonly usersQueryRepository: UsersQueryRepository,
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

    const tokens = await this.jwtService.createJWT(userId);

    if (!tokens) {
      throw new HttpException('', HttpStatus.UNAUTHORIZED);
    }

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}
