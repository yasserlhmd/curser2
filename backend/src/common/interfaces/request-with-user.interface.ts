import { Request } from 'express';
import { User } from '../../database/entities/user.entity';
import { JwtPayload } from './jwt-payload.interface';

/**
 * Request with User Interface
 * Extends Express Request to include user and token information
 */
export interface RequestWithUser extends Request {
  user: User;
  token: JwtPayload;
}

