import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from '../../database/entities/task.entity';
import { UserResponseDto } from '../../users/dto/user-response.dto';

/**
 * Task Response DTO
 * Task data returned in API responses
 */
export class TaskResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false, nullable: true })
  description: string | null;

  @ApiProperty({ enum: TaskStatus })
  status: TaskStatus;

  @ApiProperty({ required: false, nullable: true })
  userId: number | null;

  @ApiProperty({ required: false, nullable: true, type: UserResponseDto })
  user: UserResponseDto | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

