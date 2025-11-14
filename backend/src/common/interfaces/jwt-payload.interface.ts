/**
 * JWT Payload Interface
 * Defines the structure of JWT token payload
 */
export interface JwtPayload {
  userId: number;
  email: string;
  jti: string; // JWT ID
  version: number; // Token version for revocation
  type: 'access' | 'refresh';
  iat: number; // Issued at
  exp: number; // Expiration
}

