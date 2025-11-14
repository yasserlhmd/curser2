import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { User } from '../database/entities/user.entity';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';

/**
 * Auth Controller
 * Handles authentication-related HTTP requests
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully', type: AuthResponseDto })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@Req() req: Request & { token?: JwtPayload }) {
    // Extract token from request if available (set by optional guard)
    if (req.token) {
      try {
        const expiresAt = new Date(req.token.exp * 1000);
        await this.authService.logout(req.token.jti, req.token.userId, expiresAt);
      } catch (error) {
        // Token invalid, but still return success
      }
    }
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user information' })
  @ApiResponse({ status: 200, description: 'User information' })
  async getMe(@CurrentUser() user: User) {
    // Return object with user - TransformInterceptor will wrap it
    return {
      user: this.usersService.toResponseDto(user),
    };
  }

  @Get('users')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users (for task filtering)' })
  @ApiResponse({ status: 200, description: 'List of users' })
  async getAllUsers() {
    const users = await this.usersService.findAll();
    // Return object with users array - TransformInterceptor will wrap it
    return {
      users: users.map(user => this.usersService.toResponseDto(user)),
    };
  }

  @Post('revoke-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke all user tokens' })
  @ApiResponse({ status: 200, description: 'All tokens revoked' })
  async revokeAll(@CurrentUser() user: User) {
    const newVersion = await this.usersService.incrementTokenVersion(user.id);
    return {
      message: 'All tokens revoked successfully',
      newTokenVersion: newVersion,
    };
  }
}

