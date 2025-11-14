import { ApiProperty } from '@nestjs/swagger';

/**
 * User Response DTO
 * User data returned in API responses (without sensitive information)
 */
export class UserResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false, nullable: true })
  name: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ required: false, nullable: true })
  lastLogin: Date | null;
}

