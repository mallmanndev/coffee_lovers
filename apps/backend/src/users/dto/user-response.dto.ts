import { User } from '../domain/user.entity';

export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  createdAt: string;

  static fromEntity(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.getId()!;
    dto.name = user.getName();
    dto.email = user.getEmail();
    dto.createdAt = user.getCreatedAt().toISOString();
    return dto;
  }
}

export class AuthResponseDto {
  user: UserResponseDto;
  accessToken: string;
}
