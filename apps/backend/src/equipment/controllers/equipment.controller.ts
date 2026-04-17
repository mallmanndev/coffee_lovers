import { Controller, UseGuards } from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { equipmentContract } from '@coffee-lovers/shared';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AddUserEquipmentUseCase } from '../use-cases/add-user-equipment.use-case';
import { UpdateUserEquipmentUseCase } from '../use-cases/update-user-equipment.use-case';
import { DeleteUserEquipmentUseCase } from '../use-cases/delete-user-equipment.use-case';
import { EquipmentRepository } from '../repositories/equipment.repository';
import { UserEquipmentRepository } from '../repositories/user-equipment.repository';

@Controller()
export class EquipmentController {
  constructor(
    private readonly addUserEquipmentUseCase: AddUserEquipmentUseCase,
    private readonly updateUserEquipmentUseCase: UpdateUserEquipmentUseCase,
    private readonly deleteUserEquipmentUseCase: DeleteUserEquipmentUseCase,
    private readonly equipmentRepository: EquipmentRepository,
    private readonly userEquipmentRepository: UserEquipmentRepository,
  ) {}

  @TsRestHandler(equipmentContract.create)
  @UseGuards(JwtAuthGuard)
  async create(@CurrentUser() user: { sub: string }): Promise<unknown> {
    return tsRestHandler(equipmentContract.create, async ({ body }) => {
      const result = await this.addUserEquipmentUseCase.execute(body, user.sub);
      return {
        status: 201,
        body: this.mapToMergedDto(result.equipment, result.userEquipment),
      };
    });
  }

  @TsRestHandler(equipmentContract.list)
  async list(): Promise<unknown> {
    return tsRestHandler(equipmentContract.list, async ({ query }) => {
      const equipments = await this.equipmentRepository.findAll({ type: query.type });
      return {
        status: 200,
        body: equipments.map((e) => this.mapEquipmentToDto(e)),
      };
    });
  }

  @TsRestHandler(equipmentContract.get)
  async get(@CurrentUser() user?: { sub: string }): Promise<unknown> {
    return tsRestHandler(equipmentContract.get, async ({ params }) => {
      const equipment = await this.equipmentRepository.findById(params.id);
      if (!equipment) return { status: 404, body: { message: 'Equipamento não encontrado' } };

      const userEquipment = user
        ? await this.userEquipmentRepository.findByUserIdAndEquipmentId(user.sub, params.id)
        : null;

      return {
        status: 200,
        body: this.mapToMergedDto(equipment, userEquipment),
      };
    });
  }

  @TsRestHandler(equipmentContract.update)
  @UseGuards(JwtAuthGuard)
  async update(@CurrentUser() user: { sub: string }): Promise<unknown> {
    return tsRestHandler(equipmentContract.update, async ({ params, body }) => {
      const updated = await this.updateUserEquipmentUseCase.execute(params.id, user.sub, body);
      return {
        status: 200,
        body: this.mapUserEquipmentToDto(updated),
      };
    });
  }

  @TsRestHandler(equipmentContract.delete)
  @UseGuards(JwtAuthGuard)
  async delete(@CurrentUser() user: { sub: string }): Promise<unknown> {
    return tsRestHandler(equipmentContract.delete, async ({ params }) => {
      await this.deleteUserEquipmentUseCase.execute(params.id, user.sub);
      return {
        status: 204,
        body: null,
      };
    });
  }

  private mapEquipmentToDto(e: any) {
    return {
      id: e.getId(),
      type: e.getType(),
      name: e.getName(),
      model: e.getModel(),
      brand: e.getBrand(),
      description: e.getDescription() || undefined,
      photos: e.getPhotos(),
      createdById: e.getCreatedById(),
      typeSpecificData: e.getTypeSpecificData(),
      createdAt: e.getCreatedAt().toISOString(),
      updatedAt: e.getUpdatedAt().toISOString(),
    };
  }

  private mapUserEquipmentToDto(ue: any) {
    return {
      id: ue.getId(),
      equipmentId: ue.getEquipmentId(),
      userId: ue.getUserId(),
      description: ue.getDescription() || undefined,
      modifications: ue.getModifications(),
      photos: ue.getPhotos(),
      typeSpecificData: ue.getTypeSpecificData(),
      createdAt: ue.getCreatedAt().toISOString(),
      updatedAt: ue.getUpdatedAt().toISOString(),
    };
  }

  private mapToMergedDto(e: any, ue: any | null) {
    const equipment = this.mapEquipmentToDto(e);

    if (!ue) {
      return {
        ...equipment,
        isOwned: false,
      };
    }

    return {
      ...equipment,
      // Se tiver no userEquipment, substitui na base
      description: ue.getDescription() || equipment.description,
      photos: ue.getPhotos().length > 0 ? ue.getPhotos() : equipment.photos,
      typeSpecificData:
        Object.keys(ue.getTypeSpecificData() || {}).length > 0
          ? ue.getTypeSpecificData()
          : equipment.typeSpecificData,
      // Dados extras da posse
      userEquipmentId: ue.getId(),
      modifications: ue.getModifications(),
      isOwned: true,
    };
  }
}
