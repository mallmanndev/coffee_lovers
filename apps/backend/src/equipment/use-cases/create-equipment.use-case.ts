import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { Equipment } from '../domain/equipment.entity';
import { UserEquipment } from '../domain/user-equipment.entity';
import { EquipmentRepository } from '../repositories/equipment.repository';
import { UserEquipmentRepository } from '../repositories/user-equipment.repository';
import { CreateEquipmentInput, CreateEquipmentOutput } from '@coffee-lovers/shared';

@Injectable()
export class CreateEquipmentUseCase {
  constructor(
    private readonly equipmentRepository: EquipmentRepository,
    private readonly userEquipmentRepository: UserEquipmentRepository,
  ) {}

  async execute(dto: CreateEquipmentInput, userId: string): Promise<CreateEquipmentOutput> {
    let baseEquipment: Equipment;

    if (dto.equipmentId) {
      const found = await this.equipmentRepository.findById(dto.equipmentId);
      if (!found) {
        throw new NotFoundException('Equipamento base não encontrado');
      }
      baseEquipment = found;
    } else {
      const newEquipment = Equipment.create({
        type: dto.type,
        name: dto.name,
        model: dto.model,
        brand: dto.brand,
        description: dto.description,
        photos: dto.photos,
        createdById: userId,
        typeSpecificData: {}, // Início vazio, admin curará depois
      });
      baseEquipment = await this.equipmentRepository.create(newEquipment);
    }

    const existing = await this.userEquipmentRepository.findByUserIdAndEquipmentId(
      userId,
      baseEquipment.getId()!,
    );
    if (existing) {
      throw new ConflictException('Você já possui este equipamento em sua coleção');
    }

    const userEquipment = UserEquipment.create({
      equipmentId: baseEquipment.getId()!,
      userId: userId,
      description: dto.description,
      modifications: dto.modifications,
      photos: dto.photos,
      typeSpecificData: dto.typeSpecificData || {},
    });

    const createdUserEquipment = await this.userEquipmentRepository.create(userEquipment);

    return {
      id: baseEquipment.getId()!,
      type: baseEquipment.getType() as any,
      name: baseEquipment.getName(),
      model: baseEquipment.getModel(),
      brand: baseEquipment.getBrand(),
      description: baseEquipment.getDescription() || undefined,
      photos: baseEquipment.getPhotos(),
      createdById: baseEquipment.getCreatedById(),
      typeSpecificData: {
        ...(baseEquipment.getTypeSpecificData() || {}),
        ...(createdUserEquipment.getTypeSpecificData() || {}),
      },
      userEquipmentId: createdUserEquipment.getId()!,
      modifications: createdUserEquipment.getModifications() as any[],
      createdAt: createdUserEquipment.getCreatedAt()!.toISOString(),
      updatedAt: createdUserEquipment.getUpdatedAt()!.toISOString(),
    };
  }
}

