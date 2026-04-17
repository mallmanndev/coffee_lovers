import { Controller, UseGuards } from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { equipamentContract } from '@coffee-lovers/shared';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CreateEquipamentUseCase } from '../use-cases/create-equipament.use-case';
import { UpdateUserEquipamentUseCase } from '../use-cases/update-user-equipament.use-case';
import { DeleteUserEquipamentUseCase } from '../use-cases/delete-user-equipament.use-case';
import { EquipamentRepository } from '../repositories/equipament.repository';
import { UserEquipamentRepository } from '../repositories/user-equipament.repository';

@Controller()
export class EquipamentController {
  constructor(
    private readonly createEquipamentUseCase: CreateEquipamentUseCase,
    private readonly updateUserEquipamentUseCase: UpdateUserEquipamentUseCase,
    private readonly deleteUserEquipamentUseCase: DeleteUserEquipamentUseCase,
    private readonly equipamentRepository: EquipamentRepository,
    private readonly userEquipamentRepository: UserEquipamentRepository,
  ) {}

  @TsRestHandler(equipamentContract.create)
  @UseGuards(JwtAuthGuard)
  async create(@CurrentUser() user: { sub: string }): Promise<unknown> {
    return tsRestHandler(equipamentContract.create, async ({ body }) => {
      const result = await this.createEquipamentUseCase.execute(body, user.sub);
      return {
        status: 201,
        body: result,
      };
    });
  }

  @TsRestHandler(equipamentContract.list)
  @UseGuards(JwtAuthGuard)
  async list(@CurrentUser() user: { sub: string }): Promise<unknown> {
    return tsRestHandler(equipamentContract.list, async ({ query }) => {
      const equipaments = await this.equipamentRepository.findAll({
        type: query.type,
        text: query.text,
        userOnly: query.userOnly,
        userId: user.sub,
      });
      return {
        status: 200,
        body: equipaments.map((e) => this.mapEquipamentToDto(e)),
      };
    });
  }

  @TsRestHandler(equipamentContract.get)
  async get(@CurrentUser() user?: { sub: string }): Promise<unknown> {
    return tsRestHandler(equipamentContract.get, async ({ params }) => {
      const equipament = await this.equipamentRepository.findById(params.id);
      if (!equipament) return { status: 404, body: { message: 'Equipamento não encontrado' } };

      const userEquipament = user
        ? await this.userEquipamentRepository.findByUserIdAndEquipamentId(user.sub, params.id)
        : null;

      return {
        status: 200,
        body: this.mapToMergedDto(equipament, userEquipament),
      };
    });
  }

  @TsRestHandler(equipamentContract.update)
  @UseGuards(JwtAuthGuard)
  async update(@CurrentUser() user: { sub: string }): Promise<unknown> {
    return tsRestHandler(equipamentContract.update, async ({ params, body }) => {
      const updated = await this.updateUserEquipamentUseCase.execute(params.id, user.sub, body);
      return {
        status: 200,
        body: this.mapUserEquipamentToDto(updated),
      };
    });
  }

  @TsRestHandler(equipamentContract.delete)
  @UseGuards(JwtAuthGuard)
  async delete(@CurrentUser() user: { sub: string }): Promise<unknown> {
    return tsRestHandler(equipamentContract.delete, async ({ params }) => {
      await this.deleteUserEquipamentUseCase.execute(params.id, user.sub);
      return {
        status: 204,
        body: null,
      };
    });
  }

  private mapEquipamentToDto(e: any) {
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

  private mapUserEquipamentToDto(ue: any) {
    return {
      id: ue.getId(),
      equipamentId: ue.getEquipamentId(),
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
    const equipament = this.mapEquipamentToDto(e);

    if (!ue) {
      return {
        ...equipament,
        isOwned: false,
      };
    }

    return {
      ...equipament,
      // Se tiver no userEquipament, substitui na base
      description: ue.getDescription() || equipament.description,
      photos: ue.getPhotos().length > 0 ? ue.getPhotos() : equipament.photos,
      typeSpecificData:
        Object.keys(ue.getTypeSpecificData() || {}).length > 0
          ? ue.getTypeSpecificData()
          : equipament.typeSpecificData,
      // Dados extras da posse
      userEquipamentId: ue.getId(),
      modifications: ue.getModifications(),
      isOwned: true,
    };
  }
}
