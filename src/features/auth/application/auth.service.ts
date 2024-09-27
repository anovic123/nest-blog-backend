import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AuthRepository } from '../infra/auth-repository';

import { CryptoService } from 'src/core/application/crypto-service';
import { UserOutputModel } from '../api/models/output/user.output.model';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly cryptoService: CryptoService,
    private readonly authRepository: AuthRepository,
  ) {}

  public async createUser(body: {
    login: string;
    password: string;
    email: string;
  }): Promise<UserOutputModel | null> {
    const passwordHash = await this.cryptoService.generateHash(
      body.password,
      10,
    );
    const user = {
      ...body,
      createdAt: new Date().toISOString(),
      passwordHash,
    };
    const createdResult = await this.authRepository.createUser(user);

    return createdResult;
  }
}
