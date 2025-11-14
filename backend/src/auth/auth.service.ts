import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { TokenRevocationService } from '../token-revocation/token-revocation.service';
import { ConfigService } from '../config/config.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

/**
 * Auth Service
 * Handles authentication business logic
 */
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private tokenRevocationService: TokenRevocationService,
    private configService: ConfigService,
  ) {}

  /**
   * Register a new user
   */
  async register(registerDto: RegisterDto) {
    // Check if user exists
    const existingUser = await this.usersService.findOneByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Validate password strength
    this.validatePasswordStrength(registerDto.password);

    // Hash password
    const saltRounds = this.configService.password.saltRounds;
    const passwordHash = await bcrypt.hash(registerDto.password, saltRounds);
    const passwordSalt = ''; // bcrypt includes salt in hash

    // Create user
    const user = await this.usersService.create({
      email: registerDto.email,
      passwordHash,
      passwordSalt,
      name: registerDto.name,
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: this.usersService.toResponseDto(user),
      ...tokens,
    };
  }

  /**
   * Login user
   */
  async login(loginDto: LoginDto) {
    // Find user
    const user = await this.usersService.findOneByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Update last login
    await this.usersService.updateLastLogin(user.id);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: this.usersService.toResponseDto(user),
      ...tokens,
    };
  }

  /**
   * Logout user (revoke token)
   */
  async logout(jti: string, userId: number, expiresAt: Date) {
    await this.tokenRevocationService.revokeToken(jti, userId, expiresAt, 'logout');
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(user: any) {
    // Create payload without exp and iat - JWT service will add them automatically when using expiresIn
    const payload = {
      userId: user.id,
      email: user.email,
      jti: uuidv4(),
      version: user.tokenVersion,
      type: 'access' as const,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.jwt.expiresIn,
    });

    const refreshPayload = { ...payload, type: 'refresh' as const };
    const refreshToken = this.jwtService.sign(refreshPayload, {
      expiresIn: this.configService.jwt.refreshExpiresIn,
    });

    return { accessToken, refreshToken };
  }

  /**
   * Validate password strength
   */
  private validatePasswordStrength(password: string): void {
    const errors: string[] = [];
    const minLength = this.configService.password.minLength;

    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters`);
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (errors.length > 0) {
      throw new UnauthorizedException(errors.join(', '));
    }
  }
}

