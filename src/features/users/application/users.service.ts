import { Injectable } from '@nestjs/common';

import { UsersRepository } from '../infra/users.repository';

import { UserOutputType } from '../dto';
import { CryptoService } from './crypto.service';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
  ) {}

  public async createUser(body: {
    login: string;
    password: string;
    email: string;
  }): Promise<UserOutputType | null> {
    const passwordHash = await this.cryptoService.generateHash(
      body.password,
      10,
    );
    const user = {
      ...body,
      createdAt: new Date().toISOString(),
      passwordHash,
    };
    const createdResult = await this.usersRepository.createUser(user);

    return createdResult;
  }

  public async deleteUser(id: string): Promise<boolean> {
    return this.usersRepository.deleteUser(id);
  }
}
