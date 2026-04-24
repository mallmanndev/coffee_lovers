import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { EquipamentController } from './equipament.controller';
import { CreateEquipamentUseCase } from '../use-cases/create-equipament.use-case';
import { UpdateUserEquipamentUseCase } from '../use-cases/update-user-equipament.use-case';
import { DeleteUserEquipamentUseCase } from '../use-cases/delete-user-equipament.use-case';
import { EquipamentRepository } from '../repositories/equipament.repository';
import { UserEquipamentRepository } from '../repositories/user-equipament.repository';
import { Equipament } from '../domain/equipament.entity';
import { UserEquipament } from '../domain/user-equipament.entity';

describe('EquipamentController', () => {
  let controller: EquipamentController;
  let createUseCase: jest.Mocked<CreateEquipamentUseCase>;
  let updateUseCase: jest.Mocked<UpdateUserEquipamentUseCase>;
  let deleteUseCase: jest.Mocked<DeleteUserEquipamentUseCase>;
  let equipamentRepo: jest.Mocked<EquipamentRepository>;
  let userEquipamentRepo: jest.Mocked<UserEquipamentRepository>;

  const mockUser = { sub: 'user-123' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EquipamentController],
      providers: [
        {
          provide: JwtService,
          useValue: { verifyAsync: jest.fn() },
        },
        {
          provide: CreateEquipamentUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdateUserEquipamentUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: DeleteUserEquipamentUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: EquipamentRepository,
          useValue: { findAll: jest.fn(), findById: jest.fn() },
        },
        {
          provide: UserEquipamentRepository,
          useValue: { findByUserIdAndEquipamentId: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<EquipamentController>(EquipamentController);
    createUseCase = module.get(CreateEquipamentUseCase);
    updateUseCase = module.get(UpdateUserEquipamentUseCase);
    deleteUseCase = module.get(DeleteUserEquipamentUseCase);
    equipamentRepo = module.get(EquipamentRepository);
    userEquipamentRepo = module.get(UserEquipamentRepository);
  });

  describe('create', () => {
    it('should call CreateEquipamentUseCase and return 201', async () => {
      const dto = { type: 'GRINDER' as const, name: 'Test' };
      const expectedResult = { id: '1', ...dto };
      createUseCase.execute.mockResolvedValue(expectedResult as any);

      // ts-rest handler call simulation (controller methods are async)
      const handler = (await controller.create(mockUser)) as any;
      const result = await handler({ body: dto });

      expect(createUseCase.execute).toHaveBeenCalledWith(dto, mockUser.sub);
      expect(result).toEqual({
        status: 201,
        body: expectedResult,
      });
    });
  });

  describe('list', () => {
    it('should return list of equipments', async () => {
      const mockEquipament = Equipament.create({
        id: '1',
        type: 'GRINDER',
        name: 'Test',
        model: 'M1',
        brand: 'B1',
        createdById: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      equipamentRepo.findAll.mockResolvedValue([mockEquipament]);

      const handler = (await controller.list(mockUser)) as any;
      const result = await handler({ query: {} });

      expect(equipamentRepo.findAll).toHaveBeenCalled();
      expect(result.status).toBe(200);
      expect(result.body).toHaveLength(1);
      expect(result.body[0].name).toBe('Test');
    });
  });

  describe('get', () => {
    it('should return 404 if equipment not found', async () => {
      equipamentRepo.findById.mockResolvedValue(null);

      const handler = (await controller.get(mockUser)) as any;
      const result = await handler({ params: { id: '1' } });

      expect(result).toEqual({
        status: 404,
        body: { message: 'Equipamento não encontrado' },
      });
    });

    it('should return combined equipment data if found', async () => {
      const mockEquipament = Equipament.create({
        id: '1',
        type: 'GRINDER',
        name: 'Test',
        model: 'M1',
        brand: 'B1',
        createdById: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      equipamentRepo.findById.mockResolvedValue(mockEquipament);
      userEquipamentRepo.findByUserIdAndEquipamentId.mockResolvedValue(null);

      const handler = (await controller.get(mockUser)) as any;
      const result = await handler({ params: { id: '1' } });

      expect(result.status).toBe(200);
      expect(result.body.id).toBe('1');
      expect(result.body.isOwned).toBe(false);
    });
  });

  describe('update', () => {
    it('should call UpdateUserEquipamentUseCase and return 200', async () => {
      const dto = { description: 'New' };
      const mockUserEq = UserEquipament.create({
        id: 'ue-1',
        userId: mockUser.sub,
        equipamentId: 'e-1',
        description: 'New',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      updateUseCase.execute.mockResolvedValue(mockUserEq);

      const handler = (await controller.update(mockUser)) as any;
      const result = await handler({ params: { id: 'e-1' }, body: dto });

      expect(updateUseCase.execute).toHaveBeenCalledWith('e-1', mockUser.sub, dto);
      expect(result.status).toBe(200);
      expect(result.body.description).toBe('New');
    });
  });

  describe('delete', () => {
    it('should call DeleteUserEquipamentUseCase and return 204', async () => {
      deleteUseCase.execute.mockResolvedValue(undefined);

      const handler = (await controller.delete(mockUser)) as any;
      const result = await handler({ params: { id: 'e-1' } });

      expect(deleteUseCase.execute).toHaveBeenCalledWith('e-1', mockUser.sub);
      expect(result).toEqual({
        status: 204,
        body: null,
      });
    });
  });
});
