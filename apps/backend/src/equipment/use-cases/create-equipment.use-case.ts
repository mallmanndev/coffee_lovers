import { Injectable } from '@nestjs/common';
import { Equipment } from '../domain/equipment.entity';
import { EquipmentRepository } from '../repositories/equipment.repository';
import { EquipmentBase } from '@coffee-lovers/shared';

@Injectable()
export class CreateEquipmentUseCase {
  constructor(private readonly equipmentRepository: EquipmentRepository) {}

  async execute(dto: EquipmentBase, createdById: string): Promise<Equipment> {
    const equipment = Equipment.create({
      type: dto.type,
      name: dto.name,
      model: dto.model,
      brand: dto.brand,
      description: dto.description,
      photos: dto.photos,
      createdById: createdById,
      typeSpecificData: {}, // Início vazio, admin curará depois ou vira do payload se necessário
    });

    return this.equipmentRepository.create(equipment);
  }
}
