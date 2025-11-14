import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Transform Interceptor
 * Wraps successful responses in a consistent format
 */
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // If data is already formatted, return as is
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // Format response
        return {
          success: true,
          data,
        };
      }),
    );
  }
}

