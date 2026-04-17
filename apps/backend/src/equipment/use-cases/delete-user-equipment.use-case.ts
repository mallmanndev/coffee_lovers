import { Injectable, NotFoundException } from '@nestjs/common';
import { UserEquipmentRepository } from '../repositories/user-equipment.repository';

@Injectable()
export class DeleteUserEquipmentUseCase {
  constructor(private readonly userEquipmentRepository: UserEquipmentRepository) {}

  async execute(equipmentId: string, userId: string): Promise<void> {
    const userEquipment = await this.userEquipmentRepository.findByUserIdAndEquipmentId(userId, equipmentId);
    if (!userEquipment) {
      throw new NotFoundException('Equipamento não encontrado na sua coleção');
    }

    await this.userEquipmentRepository.delete(userId, equipmentId);
  }
}
