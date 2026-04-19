import { User } from '../domain/user.entity';

export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  city: string;
  state: string;
  createdAt: string;
  updatedAt: string;

  static fromEntity(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.getId()!;
    dto.name = user.getName();
    dto.email = user.getEmail();
    dto.city = user.getCity();
    dto.state = user.getState();
    dto.createdAt = user.getCreatedAt().toISOString();
    dto.updatedAt = user.getUpdatedAt().toISOString();
    return dto;
  }
}

export class AuthResponseDto {
  user: UserResponseDto;
  accessToken: string;
}
