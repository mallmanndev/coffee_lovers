import { Controller, UseGuards } from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import {
  equipamentContract,
  EquipamentType,
  UserEquipamentResponse,
} from '@coffee-lovers/shared';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CreateEquipamentUseCase } from '../use-cases/create-equipament.use-case';
import { UpdateUserEquipamentUseCase } from '../use-cases/update-user-equipament.use-case';
import { DeleteUserEquipamentUseCase } from '../use-cases/delete-user-equipament.use-case';
import { EquipamentRepository } from '../repositories/equipament.repository';
import { UserEquipamentRepository } from '../repositories/user-equipament.repository';
import { Equipament } from '../domain/equipament.entity';
import { UserEquipament } from '../domain/user-equipament.entity';

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
  create(@CurrentUser() user: { sub: string }) {
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
  list(@CurrentUser() user: { sub: string }) {
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
  get(@CurrentUser() user?: { sub: string }) {
    return tsRestHandler(equipamentContract.get, async ({ params }) => {
      const equipament = await this.equipamentRepository.findById(params.id);
      if (!equipament)
        return { status: 404, body: { message: 'Equipamento não encontrado' } };

      const userEquipament = user
        ? await this.userEquipamentRepository.findByUserIdAndEquipamentId(
            user.sub,
            params.id,
          )
        : null;

      return {
        status: 200,
        body: this.mapToMergedDto(equipament, userEquipament),
      };
    });
  }

  @TsRestHandler(equipamentContract.update)
  @UseGuards(JwtAuthGuard)
  update(@CurrentUser() user: { sub: string }) {
    return tsRestHandler(
      equipamentContract.update,
      async ({ params, body }) => {
        const updated = await this.updateUserEquipamentUseCase.execute(
          params.id,
          user.sub,
          body,
        );
        return {
          status: 200,
          body: this.mapUserEquipamentToDto(updated),
        };
      },
    );
  }

  @TsRestHandler(equipamentContract.delete)
  @UseGuards(JwtAuthGuard)
  delete(@CurrentUser() user: { sub: string }) {
    return tsRestHandler(equipamentContract.delete, async ({ params }) => {
      await this.deleteUserEquipamentUseCase.execute(params.id, user.sub);
      return {
        status: 204,
        body: null,
      };
    });
  }

  private mapEquipamentToDto(e: Equipament) {
    return {
      id: e.getId() as string,
      type: e.getType() as EquipamentType,
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

  private mapUserEquipamentToDto(ue: UserEquipament): UserEquipamentResponse {
    return {
      id: ue.getId() as string,
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

  private mapToMergedDto(e: Equipament, ue: UserEquipament | null) {
    const equipament = this.mapEquipamentToDto(e);

    if (!ue) {
      return {
        ...equipament,
        isOwned: false,
        modifications: [],
        userPhotos: [],
      };
    }

    return {
      ...equipament,
      userEquipamentId: ue.getId() as string,
      description: ue.getDescription() || equipament.description,
      modifications: ue.getModifications(),
      userPhotos: ue.getPhotos(),
      userTypeSpecificData: ue.getTypeSpecificData(),
      isOwned: true,
    };
  }
}
