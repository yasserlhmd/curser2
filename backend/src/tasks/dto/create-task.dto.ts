import { IsString, IsOptional, IsEnum, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from '../../database/entities/task.entity';

/**
 * Create Task DTO
 * Data transfer object for creating a new task
 */
export class CreateTaskDto {
  @ApiProperty({ example: 'Complete project documentation', description: 'Task title' })
  @IsString()
  @MinLength(1, { message: 'Title cannot be empty' })
  title: string;

  @ApiProperty({ example: 'Write comprehensive documentation', required: false, description: 'Task description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: TaskStatus, required: false, default: TaskStatus.PENDING, description: 'Task status' })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}

