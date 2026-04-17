import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TsRestModule } from '@ts-rest/nest';
import { EquipmentController } from './controllers/equipment.controller';
import { MongooseEquipmentRepository } from './repositories/equipment.repository.impl';
import { EquipmentRepository } from './repositories/equipment.repository';
import { EquipmentDocument, EquipmentSchema } from './schemas/equipment.schema';
import { UserEquipmentDocument, UserEquipmentSchema } from './schemas/user-equipment.schema';
import { MongooseUserEquipmentRepository } from './repositories/user-equipment.repository.impl';
import { UserEquipmentRepository } from './repositories/user-equipment.repository';
import { CreateEquipmentUseCase } from './use-cases/create-equipment.use-case';
import { AddUserEquipmentUseCase } from './use-cases/add-user-equipment.use-case';
import { UpdateUserEquipmentUseCase } from './use-cases/update-user-equipment.use-case';
import { DeleteUserEquipmentUseCase } from './use-cases/delete-user-equipment.use-case';

@Module({
  imports: [
    TsRestModule.register({}),
    MongooseModule.forFeature([
      { name: EquipmentDocument.name, schema: EquipmentSchema },
      { name: UserEquipmentDocument.name, schema: UserEquipmentSchema },
    ]),
  ],
  controllers: [EquipmentController],
  providers: [
    CreateEquipmentUseCase,
    AddUserEquipmentUseCase,
    UpdateUserEquipmentUseCase,
    DeleteUserEquipmentUseCase,
    {
      provide: EquipmentRepository,
      useClass: MongooseEquipmentRepository,
    },
    {
      provide: UserEquipmentRepository,
      useClass: MongooseUserEquipmentRepository,
    },
  ],
  exports: [EquipmentRepository, UserEquipmentRepository],
})
export class EquipmentModule {}
