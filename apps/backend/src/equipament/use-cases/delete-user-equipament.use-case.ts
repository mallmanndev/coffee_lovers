import { Injectable, NotFoundException } from '@nestjs/common';
import { UserEquipamentRepository } from '../repositories/user-equipament.repository';

@Injectable()
export class DeleteUserEquipamentUseCase {
  constructor(private readonly userEquipamentRepository: UserEquipamentRepository) {}

  async execute(equipamentId: string, userId: string): Promise<void> {
    const userEquipament = await this.userEquipamentRepository.findByUserIdAndEquipamentId(userId, equipamentId);
    if (!userEquipament) {
      throw new NotFoundException('Equipamento não encontrado na sua coleção');
    }

    await this.userEquipamentRepository.delete(userId, equipamentId);
  }
}
