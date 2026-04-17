import { Injectable, ConflictException } from '@nestjs/common';
import { CreateEquipmentUseCase } from './create-equipment.use-case';
import { UserEquipmentRepository } from '../repositories/user-equipment.repository';
import { UserEquipment } from '../domain/user-equipment.entity';
import { EquipmentBase, UserEquipmentBase } from '@coffee-lovers/shared';

@Injectable()
export class AddUserEquipmentUseCase {
  constructor(
    private readonly createEquipmentUseCase: CreateEquipmentUseCase,
    private readonly userEquipmentRepository: UserEquipmentRepository,
  ) {}

  async execute(dto: { base: EquipmentBase; user: UserEquipmentBase }, userId: string) {
    // 1. Criar o equipamento no catálogo base
    const baseEquipment = await this.createEquipmentUseCase.execute(dto.base, userId);

    // 2. Verificar se o usuário já tem esse equipamento (pela composição de índice único)
    const existing = await this.userEquipmentRepository.findByUserIdAndEquipmentId(
      userId,
      baseEquipment.getId()!,
    );
    if (existing) {
      throw new ConflictException('Você já possui este equipamento em sua coleção');
    }

    // 3. Criar a posse do usuário (UserEquipment)
    const userEquipment = UserEquipment.create({
      equipmentId: baseEquipment.getId()!,
      userId: userId,
      description: dto.user.description,
      modifications: dto.user.modifications,
      photos: dto.user.photos,
      typeSpecificData: dto.user.typeSpecificData,
    });

    const createdUserEquipment = await this.userEquipmentRepository.create(userEquipment);

    return {
      equipment: baseEquipment,
      userEquipment: createdUserEquipment,
    };
  }
}
