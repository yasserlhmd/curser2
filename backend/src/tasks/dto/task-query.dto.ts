import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus } from '../../database/entities/task.entity';

/**
 * Task Query DTO
 * Query parameters for filtering tasks
 */
export class TaskQueryDto {
  @ApiPropertyOptional({ enum: TaskStatus, description: 'Filter by task status' })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({ 
    example: 'all', 
    description: 'Filter by user: "all" (all users), "me" (current user), or specific user ID' 
  })
  @IsOptional()
  @IsString()
  user_id?: string;
}

