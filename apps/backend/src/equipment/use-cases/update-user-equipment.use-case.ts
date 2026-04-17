import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserEquipmentRepository } from '../repositories/user-equipment.repository';
import { UserEquipment } from '../domain/user-equipment.entity';
import { UserEquipmentBase } from '@coffee-lovers/shared';

@Injectable()
export class UpdateUserEquipmentUseCase {
  constructor(private readonly userEquipmentRepository: UserEquipmentRepository) {}

  async execute(equipmentId: string, userId: string, dto: Partial<UserEquipmentBase>): Promise<UserEquipment> {
    const userEquipment = await this.userEquipmentRepository.findByUserIdAndEquipmentId(userId, equipmentId);
    if (!userEquipment) {
      throw new NotFoundException('Equipamento não encontrado na sua coleção');
    }

    const updated = userEquipment.update({
      description: dto.description,
      modifications: dto.modifications,
      photos: dto.photos,
      typeSpecificData: dto.typeSpecificData,
    });

    return this.userEquipmentRepository.update(updated);
  }
}
