import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

/**
 * Users Controller
 * Handles user-related HTTP requests
 */
@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users (for task filtering)' })
  @ApiResponse({ status: 200, description: 'List of users' })
  async findAll() {
    const users = await this.usersService.findAll();
    return {
      users: users.map(user => this.usersService.toResponseDto(user)),
    };
  }
}

