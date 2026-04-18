import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Equipament } from '../domain/equipament.entity';
import { UserEquipament } from '../domain/user-equipament.entity';
import { EquipamentRepository } from '../repositories/equipament.repository';
import { UserEquipamentRepository } from '../repositories/user-equipament.repository';
import {
  CreateEquipamentInput,
  CreateEquipamentOutput,
  EquipamentType,
} from '@coffee-lovers/shared';

@Injectable()
export class CreateEquipamentUseCase {
  constructor(
    private readonly equipamentRepository: EquipamentRepository,
    private readonly userEquipamentRepository: UserEquipamentRepository,
  ) {}

  async execute(
    dto: CreateEquipamentInput,
    userId: string,
  ): Promise<CreateEquipamentOutput> {
    let baseEquipament: Equipament;

    if (dto.equipamentId) {
      const found = await this.equipamentRepository.findById(dto.equipamentId);
      if (!found) {
        throw new NotFoundException('Equipamento base não encontrado');
      }
      baseEquipament = found;
    } else {
      const newEquipament = Equipament.create({
        type: dto.type,
        name: dto.name,
        model: dto.model,
        brand: dto.brand,
        description: dto.description,
        photos: dto.photos,
        createdById: userId,
        typeSpecificData: {}, // Início vazio, admin curará depois
      });
      baseEquipament = await this.equipamentRepository.create(newEquipament);
    }

    const existing =
      await this.userEquipamentRepository.findByUserIdAndEquipamentId(
        userId,
        baseEquipament.getId()!,
      );
    if (existing) {
      throw new ConflictException(
        'Você já possui este equipamento em sua coleção',
      );
    }

    const userEquipament = UserEquipament.create({
      equipamentId: baseEquipament.getId()!,
      userId: userId,
      description: dto.description,
      modifications: dto.modifications,
      photos: dto.photos,
      typeSpecificData: dto.typeSpecificData || {},
    });

    const createdUserEquipament =
      await this.userEquipamentRepository.create(userEquipament);

    return {
      id: baseEquipament.getId()!,
      type: baseEquipament.getType() as EquipamentType,
      name: baseEquipament.getName(),
      model: baseEquipament.getModel(),
      brand: baseEquipament.getBrand(),
      description: baseEquipament.getDescription() || undefined,
      photos: baseEquipament.getPhotos(),
      createdById: baseEquipament.getCreatedById(),
      typeSpecificData: {
        ...(baseEquipament.getTypeSpecificData() || {}),
        ...(createdUserEquipament.getTypeSpecificData() || {}),
      },
      userEquipamentId: createdUserEquipament.getId()!,
      modifications: createdUserEquipament.getModifications(),
      createdAt: createdUserEquipament.getCreatedAt().toISOString(),
      updatedAt: createdUserEquipament.getUpdatedAt().toISOString(),
    };
  }
}
