import { PartialType } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';

/**
 * Update Task DTO
 * Data transfer object for updating a task
 * All fields are optional
 */
export class UpdateTaskDto extends PartialType(CreateTaskDto) {}

