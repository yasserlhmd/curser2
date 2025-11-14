import { SetMetadata } from '@nestjs/common';

/**
 * Public Route Decorator
 * Marks a route as public (no authentication required)
 * Use with @Public() decorator on controller methods
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

