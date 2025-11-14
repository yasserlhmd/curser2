import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

/**
 * Database Service
 * Handles database connection and health checks
 */
@Injectable()
export class DatabaseService implements OnModuleInit {
  constructor(@InjectConnection() private connection: Connection) {}

  async onModuleInit() {
    try {
      await this.connection.query('SELECT NOW()');
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      throw error;
    }
  }

  /**
   * Check database connection health
   */
  async checkHealth(): Promise<boolean> {
    try {
      await this.connection.query('SELECT 1');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get database connection
   */
  getConnection(): Connection {
    return this.connection;
  }
}

