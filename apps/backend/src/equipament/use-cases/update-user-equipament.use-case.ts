import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserEquipamentRepository } from '../repositories/user-equipament.repository';
import { UserEquipament } from '../domain/user-equipament.entity';
import { UserEquipamentBase } from '@coffee-lovers/shared';

@Injectable()
export class UpdateUserEquipamentUseCase {
  constructor(
    private readonly userEquipamentRepository: UserEquipamentRepository,
  ) {}

  async execute(
    equipamentId: string,
    userId: string,
    dto: Partial<UserEquipamentBase>,
  ): Promise<UserEquipament> {
    const userEquipament =
      await this.userEquipamentRepository.findByUserIdAndEquipamentId(
        userId,
        equipamentId,
      );
    if (!userEquipament) {
      throw new NotFoundException('Equipamento não encontrado na sua coleção');
    }

    const updated = userEquipament.update({
      description: dto.description,
      modifications: dto.modifications,
      photos: dto.photos,
      typeSpecificData: dto.typeSpecificData,
    });

    return this.userEquipamentRepository.update(updated);
  }
}
