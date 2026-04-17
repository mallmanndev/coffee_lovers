import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EquipmentDocument } from '../schemas/equipment.schema';
import { UserEquipmentDocument } from '../schemas/user-equipment.schema';
import { JwtService } from '@nestjs/jwt';

describe('EquipmentController (Integration)', () => {
  let app: INestApplication;
  let equipmentModel: Model<EquipmentDocument>;
  let userEquipmentModel: Model<UserEquipmentDocument>;
  let jwtService: JwtService;
  let authToken: string;

  const userId = '60d0fe4f5311236168a109ca'; // Valid MongoDB ObjectId format

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    equipmentModel = moduleFixture.get<Model<EquipmentDocument>>(getModelToken(EquipmentDocument.name));
    userEquipmentModel = moduleFixture.get<Model<UserEquipmentDocument>>(getModelToken(UserEquipmentDocument.name));
    jwtService = moduleFixture.get<JwtService>(JwtService);

    // Gerar um token real para o usuário de teste
    authToken = jwtService.sign({
      sub: userId,
      email: 'test@example.com',
      name: 'Test User',
    });
  });

  beforeEach(async () => {
    await equipmentModel.deleteMany({});
    await userEquipmentModel.deleteMany({});
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /equipment deve criar um novo equipamento e associar ao usuário', async () => {
    const dto = {
      type: 'GRINDER' as const,
      name: 'Comandante C40',
      model: 'MK4',
      brand: 'Comandante',
      description: 'The goat of grinders',
      photos: ['photo1.jpg'],
      modifications: [],
      typeSpecificData: { clicks: 25 },
    };

    const res = await request(app.getHttpServer())
      .post('/equipment')
      .set('Authorization', `Bearer ${authToken}`)
      .send(dto);

    expect(res.status).toBe(201);
    expect(res.body.name).toBe(dto.name);
    expect(res.body.userEquipmentId).toBeDefined();
    expect(res.body.typeSpecificData.clicks).toBe(25);

    // Verificar no banco
    const dbEquipment = await equipmentModel.findOne({ name: dto.name });
    expect(dbEquipment).toBeDefined();
    
    const dbUserEq = await userEquipmentModel.findOne({ userId });
    expect(dbUserEq).toBeDefined();
    expect(dbUserEq!.equipmentId.toString()).toBe(dbEquipment!._id.toString());
  });

  it('POST /equipment deve associar um equipamento existente ao usuário via equipmentId', async () => {
    // Criar equipamento base no banco previamente
    const baseEquipment = await equipmentModel.create({
      type: 'ESPRESSO_MACHINE',
      name: 'Gaggia Classic',
      model: 'Pro',
      brand: 'Gaggia',
      createdById: 'admin-id',
      typeSpecificData: { portafilterSize: '58mm' },
    });

    const dto = {
      equipmentId: baseEquipment._id.toString(),
      type: 'ESPRESSO_MACHINE' as const,
      name: 'Ignored Name',
      model: 'Ignored Model',
      brand: 'Ignored Brand',
      typeSpecificData: { pressure: '9bar' },
    };

    const res = await request(app.getHttpServer())
      .post('/equipment')
      .set('Authorization', `Bearer ${authToken}`)
      .send(dto);

    expect(res.status).toBe(201);
    expect(res.body.id).toBe(baseEquipment._id.toString());
    expect(res.body.name).toBe('Gaggia Classic'); // Nome original do banco
    expect(res.body.typeSpecificData.pressure).toBe('9bar'); // Dado novo do UserEquipment
    expect(res.body.typeSpecificData.portafilterSize).toBe('58mm'); // Dado herdado da Base
  });

  it('GET /equipment deve listar equipamentos do catálogo', async () => {
    await equipmentModel.create([
      { type: 'GRINDER', name: 'Eq 1', model: 'M1', brand: 'B1', createdById: userId },
      { type: 'SCALE', name: 'Eq 2', model: 'M2', brand: 'B2', createdById: userId },
    ]);

    const res = await request(app.getHttpServer()).get('/equipment');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it('GET /equipment/:id deve retornar detalhes e posse do usuário', async () => {
    const eq = await equipmentModel.create({
      type: 'GRINDER', name: 'Details', model: 'M', brand: 'B', createdById: userId
    });

    const res = await request(app.getHttpServer())
      .get(`/equipment/${eq._id}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(eq._id.toString());
  });

  it('PUT /equipment/:id deve atualizar dados personalizados', async () => {
    const eq = await equipmentModel.create({
      type: 'GRINDER', name: 'To Update', model: 'M', brand: 'B', createdById: userId
    });
    
    await userEquipmentModel.create({
      userId,
      equipmentId: eq._id,
      description: 'Old desc',
    });

    const updateDto = { description: 'New description' };

    const res = await request(app.getHttpServer())
      .put(`/equipment/${eq._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updateDto);

    expect(res.status).toBe(200);
    expect(res.body.description).toBe('New description');

    const updated = await userEquipmentModel.findOne({ userId, equipmentId: eq._id });
    expect(updated!.description).toBe('New description');
  });

  it('DELETE /equipment/:id deve remover da coleção do usuário', async () => {
    const eq = await equipmentModel.create({
      type: 'GRINDER', name: 'To Delete', model: 'M', brand: 'B', createdById: userId
    });
    
    await userEquipmentModel.create({ userId, equipmentId: eq._id });

    const res = await request(app.getHttpServer())
      .delete(`/equipment/${eq._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({});

    expect(res.status).toBe(204);

    const exists = await userEquipmentModel.findOne({ userId, equipmentId: eq._id });
    expect(exists).toBeNull();
  });
});
