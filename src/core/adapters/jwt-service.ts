import jwt, { JwtPayload } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '../../features/users/domain/users.schema';

export interface JwtPayloadExtended extends JwtPayload {
  userId: string;
}

export interface JwtRefreshPayloadExtended extends JwtPayload {
  userId: string;
  deviceId: string;
}

interface JwtTokensOutput {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class JwtService {
  private readonly JWT_SECRET: string;
  private readonly EXPIRES_ACCESS_TOKEN: string;
  private readonly EXPIRES_REFRESH_TOKEN: string;

  constructor(private readonly configService: ConfigService) {
    this.JWT_SECRET = this.configService.get('jwtSettings.JWT_SECRET', {
      infer: true,
    }) as unknown as string;
    this.EXPIRES_REFRESH_TOKEN = this.configService.get(
      'jwtSettings.EXPIRES_REFRESH_TOKEN',
      {
        infer: true,
      },
    ) as unknown as string;
    this.EXPIRES_ACCESS_TOKEN = this.configService.get(
      'jwtSettings.EXPIRES_ACCESS_TOKEN',
      {
        infer: true,
      },
    ) as unknown as string;
  }

  public async createJWT(
    userId: string,
    deviceId: string = '0',
  ): Promise<JwtTokensOutput | null> {
    try {
      const accessToken = this._signAccessToken(userId);
      const refreshToken = this._signRefreshToken(userId, deviceId ?? uuidv4());

      const { exp } = jwt.decode(refreshToken) as JwtPayload;

      if (!exp) {
        throw new HttpException(
          'Failed to create JWT',
          HttpStatus.UNAUTHORIZED,
        );
      }

      return {
        accessToken,
        refreshToken,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: any) {
      return null;
    }
  }

  protected _signAccessToken(userId: string): string {
    return jwt.sign({ userId }, this.JWT_SECRET, {
      expiresIn: this.EXPIRES_ACCESS_TOKEN,
    });
  }

  protected _signRefreshToken(userId: string, deviceId: string): string {
    return jwt.sign({ userId, deviceId }, this.JWT_SECRET, {
      expiresIn: this.EXPIRES_REFRESH_TOKEN,
    });
  }

  public async verifyToken<T extends JwtPayload>(
    token: string,
  ): Promise<T | null> {
    try {
      const decodedToken = jwt.verify(token, this.JWT_SECRET) as T;

      return decodedToken;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }
}
