/* eslint-disable @typescript-eslint/no-unused-vars */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { Request } from 'express';

type RequestExtended = Request & { userId: string };

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: RequestExtended = context.switchToHttp().getRequest();
    const refreshToken = request.cookies?.refreshToken;

    if (!refreshToken) {
      return true;
    }

    try {
      const tokenPayload = this.jwtService.verify(refreshToken);
      request.userId = tokenPayload.userId;
      return true;
    } catch (err) {
      return true;
    }
  }
}
