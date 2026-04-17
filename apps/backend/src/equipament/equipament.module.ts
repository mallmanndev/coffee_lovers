import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TsRestModule } from '@ts-rest/nest';
import { EquipamentController } from './controllers/equipament.controller';
import { MongooseEquipamentRepository } from './repositories/equipament.repository.impl';
import { EquipamentRepository } from './repositories/equipament.repository';
import { EquipamentDocument, EquipamentSchema } from './schemas/equipament.schema';
import { UserEquipamentDocument, UserEquipamentSchema } from './schemas/user-equipament.schema';
import { MongooseUserEquipamentRepository } from './repositories/user-equipament.repository.impl';
import { UserEquipamentRepository } from './repositories/user-equipament.repository';
import { CreateEquipamentUseCase } from './use-cases/create-equipament.use-case';
import { UpdateUserEquipamentUseCase } from './use-cases/update-user-equipament.use-case';
import { DeleteUserEquipamentUseCase } from './use-cases/delete-user-equipament.use-case';

@Module({
  imports: [
    TsRestModule.register({}),
    MongooseModule.forFeature([
      { name: EquipamentDocument.name, schema: EquipamentSchema },
      { name: UserEquipamentDocument.name, schema: UserEquipamentSchema },
    ]),
  ],
  controllers: [EquipamentController],
  providers: [
    CreateEquipamentUseCase,
    UpdateUserEquipamentUseCase,
    DeleteUserEquipamentUseCase,
    {
      provide: EquipamentRepository,
      useClass: MongooseEquipamentRepository,
    },
    {
      provide: UserEquipamentRepository,
      useClass: MongooseUserEquipamentRepository,
    },
  ],
  exports: [EquipamentRepository, UserEquipamentRepository],
})
export class EquipamentModule {}
