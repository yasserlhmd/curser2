import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

/**
 * Optional JWT Guard
 * Attempts to authenticate but doesn't require it
 * Used for routes that work for both authenticated and unauthenticated users
 */
@Injectable()
export class OptionalJwtGuard extends AuthGuard('jwt') {
  constructor(private jwtService: JwtService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // If no token, continue without authentication
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return true;
    }

    // Try to authenticate, but don't throw if it fails
    try {
      const result = super.canActivate(context);
      if (result instanceof Promise) {
        return result.catch(() => {
          // If authentication fails, try to decode token for logout endpoint
          const token = authHeader.substring(7);
          try {
            const decoded = this.jwtService.decode(token) as JwtPayload;
            if (decoded) {
              request.token = decoded;
            }
          } catch (error) {
            // Ignore decode errors
          }
          return true;
        });
      }
      return result;
    } catch (error) {
      // If authentication fails synchronously, try to decode token
      const token = authHeader.substring(7);
      try {
        const decoded = this.jwtService.decode(token) as JwtPayload;
        if (decoded) {
          request.token = decoded;
        }
      } catch (decodeError) {
        // Ignore decode errors
      }
      return true;
    }
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    
    // If user is authenticated, return user
    if (user) {
      return user;
    }

    // If not authenticated but token exists, try to decode for logout
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = this.jwtService.decode(token) as JwtPayload;
        if (decoded) {
          request.token = decoded;
        }
      } catch (error) {
        // Ignore decode errors
      }
    }

    return null;
  }
}

