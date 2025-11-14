import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      message: 'Task Manager API is running',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
    };
  }
}

