import { Injectable } from '@nestjs/common';

import { UsersRepository } from '../infra/users.repository';

import { CryptoService } from './crypto.service';

import { UserOutputModel } from '../api/models/output/user.output.model';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly cryptoService: CryptoService,
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
    const createdResult = await this.usersRepository.createUser(user);

    return createdResult;
  }

  public async deleteUser(id: string): Promise<boolean> {
    return this.usersRepository.deleteUser(id);
  }
}
