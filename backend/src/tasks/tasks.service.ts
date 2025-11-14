import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from '../database/entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { TaskResponseDto } from './dto/task-response.dto';
import { UsersService } from '../users/users.service';

/**
 * Tasks Service
 * Handles task-related business logic
 */
@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    private usersService: UsersService,
  ) {}

  /**
   * Find all tasks with optional filters
   */
  async findAll(query: TaskQueryDto, currentUserId?: number): Promise<TaskResponseDto[]> {
    const queryBuilder = this.tasksRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.user', 'user')
      .orderBy('task.createdAt', 'DESC');

    // Filter by status
    if (query.status) {
      queryBuilder.andWhere('task.status = :status', { status: query.status });
    }

    // Filter by user
    if (query.user_id) {
      const userId = query.user_id.toLowerCase();
      if (userId === 'all') {
        // Show all tasks (no filter)
      } else if (userId === 'me') {
        if (!currentUserId) {
          throw new ForbiddenException('Authentication required to filter by "my tasks"');
        }
        queryBuilder.andWhere('task.userId = :userId', { userId: currentUserId });
      } else {
        const parsedUserId = parseInt(userId, 10);
        if (isNaN(parsedUserId)) {
          throw new ForbiddenException('Invalid user_id parameter');
        }
        queryBuilder.andWhere('task.userId = :userId', { userId: parsedUserId });
      }
    } else if (currentUserId) {
      // Default: show current user's tasks if logged in
      queryBuilder.andWhere('task.userId = :userId', { userId: currentUserId });
    }

    const tasks = await queryBuilder.getMany();
    return tasks.map(task => this.toResponseDto(task));
  }

  /**
   * Find task by ID
   */
  async findOne(id: number, currentUserId?: number): Promise<TaskResponseDto> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.toResponseDto(task);
  }

  /**
   * Create a new task
   */
  async create(createTaskDto: CreateTaskDto, userId: number): Promise<TaskResponseDto> {
    const task = this.tasksRepository.create({
      ...createTaskDto,
      userId,
      status: createTaskDto.status || TaskStatus.PENDING,
    });

    const savedTask = await this.tasksRepository.save(task);
    const taskWithUser = await this.tasksRepository.findOne({
      where: { id: savedTask.id },
      relations: ['user'],
    });

    return this.toResponseDto(taskWithUser!);
  }

  /**
   * Update a task
   */
  async update(
    id: number,
    updateTaskDto: UpdateTaskDto,
    userId: number,
  ): Promise<TaskResponseDto> {
    const task = await this.tasksRepository.findOne({
      where: { id, userId },
      relations: ['user'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Validate title if provided
    if (updateTaskDto.title !== undefined) {
      if (updateTaskDto.title.trim() === '') {
        throw new ForbiddenException('Title cannot be empty');
      }
      task.title = updateTaskDto.title.trim();
    }

    if (updateTaskDto.description !== undefined) {
      task.description = updateTaskDto.description?.trim() || null;
    }

    if (updateTaskDto.status !== undefined) {
      task.status = updateTaskDto.status;
    }

    const updatedTask = await this.tasksRepository.save(task);

    return this.toResponseDto(updatedTask);
  }

  /**
   * Delete a task
   */
  async remove(id: number, userId: number): Promise<void> {
    const task = await this.tasksRepository.findOne({
      where: { id, userId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.tasksRepository.remove(task);
  }

  /**
   * Convert Task entity to response DTO
   */
  private toResponseDto(task: Task): TaskResponseDto {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      userId: task.userId,
      user: task.user ? this.usersService.toResponseDto(task.user) : null,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }
}

