import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { createHash,randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class TokensService {
    constructor(private userService:UsersService,private jwt:JwtService,private config: ConfigService){}

    hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
    }
     generateTokens(userId: string, organizationId: string | null, role: string) {
        const payload = {
          sub: userId,
          organizationId,
          role,
        };
        const accessToken = this.jwt.sign(payload, {
          expiresIn: '15m',
        });
        const jti = randomUUID();
        const refreshToken = this.jwt.sign(
          { sub: userId,jti },
          {
            secret: this.config.getOrThrow<string>('REFRESH_TOKEN_SECRET'),
            expiresIn: '7d',
          },
        );
    
        return { accessToken, refreshToken };
      }
    
      async saveToken(refreshToken: string, userId: string) {
        const refreshTokenHased = this.hashToken(refreshToken)
        await this.userService.updateUserToken(userId,refreshTokenHased);
      }

}
