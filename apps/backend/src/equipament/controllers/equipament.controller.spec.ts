import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EquipamentDocument } from '../schemas/equipament.schema';
import { UserEquipamentDocument } from '../schemas/user-equipament.schema';
import { JwtService } from '@nestjs/jwt';

describe('EquipamentController (Integration)', () => {
  let app: INestApplication;
  let equipamentModel: Model<EquipamentDocument>;
  let userEquipamentModel: Model<UserEquipamentDocument>;
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

    equipamentModel = moduleFixture.get<Model<EquipamentDocument>>(getModelToken(EquipamentDocument.name));
    userEquipamentModel = moduleFixture.get<Model<UserEquipamentDocument>>(getModelToken(UserEquipamentDocument.name));
    jwtService = moduleFixture.get<JwtService>(JwtService);

    // Gerar um token real para o usuário de teste
    authToken = jwtService.sign({
      sub: userId,
      email: 'test@example.com',
      name: 'Test User',
    });
  });

  beforeEach(async () => {
    await equipamentModel.deleteMany({});
    await userEquipamentModel.deleteMany({});
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /equipament deve criar um novo equipamento e associar ao usuário', async () => {
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
      .post('/equipament')
      .set('Authorization', `Bearer ${authToken}`)
      .send(dto);

    expect(res.status).toBe(201);
    expect(res.body.name).toBe(dto.name);
    expect(res.body.userEquipamentId).toBeDefined();
    expect(res.body.typeSpecificData.clicks).toBe(25);

    // Verificar no banco
    const dbEquipament = await equipamentModel.findOne({ name: dto.name });
    expect(dbEquipament).toBeDefined();
    
    const dbUserEq = await userEquipamentModel.findOne({ userId });
    expect(dbUserEq).toBeDefined();
    expect(dbUserEq!.equipamentId.toString()).toBe(dbEquipament!._id.toString());
  });

  it('POST /equipament deve associar um equipamento existente ao usuário via equipamentId', async () => {
    // Criar equipamento base no banco previamente
    const baseEquipament = await equipamentModel.create({
      type: 'ESPRESSO_MACHINE',
      name: 'Gaggia Classic',
      model: 'Pro',
      brand: 'Gaggia',
      createdById: 'admin-id',
      typeSpecificData: { portafilterSize: '58mm' },
    });

    const dto = {
      equipamentId: baseEquipament._id.toString(),
      type: 'ESPRESSO_MACHINE' as const,
      name: 'Ignored Name',
      model: 'Ignored Model',
      brand: 'Ignored Brand',
      typeSpecificData: { pressure: '9bar' },
    };

    const res = await request(app.getHttpServer())
      .post('/equipament')
      .set('Authorization', `Bearer ${authToken}`)
      .send(dto);

    expect(res.status).toBe(201);
    expect(res.body.id).toBe(baseEquipament._id.toString());
    expect(res.body.name).toBe('Gaggia Classic'); // Nome original do banco
    expect(res.body.typeSpecificData.pressure).toBe('9bar'); // Dado novo do UserEquipament
    expect(res.body.typeSpecificData.portafilterSize).toBe('58mm'); // Dado herdado da Base
  });

  it('GET /equipament deve listar equipamentos do catálogo', async () => {
    await equipamentModel.create([
      { type: 'GRINDER', name: 'Eq 1', model: 'M1', brand: 'B1', createdById: userId },
      { type: 'SCALE', name: 'Eq 2', model: 'M2', brand: 'B2', createdById: userId },
    ]);

    const res = await request(app.getHttpServer()).get('/equipament');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it('GET /equipament/:id deve retornar detalhes e posse do usuário', async () => {
    const eq = await equipamentModel.create({
      type: 'GRINDER', name: 'Details', model: 'M', brand: 'B', createdById: userId
    });

    const res = await request(app.getHttpServer())
      .get(`/equipament/${eq._id}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(eq._id.toString());
  });

  it('PUT /equipament/:id deve atualizar dados personalizados', async () => {
    const eq = await equipamentModel.create({
      type: 'GRINDER', name: 'To Update', model: 'M', brand: 'B', createdById: userId
    });
    
    await userEquipamentModel.create({
      userId,
      equipamentId: eq._id,
      description: 'Old desc',
    });

    const updateDto = { description: 'New description' };

    const res = await request(app.getHttpServer())
      .put(`/equipament/${eq._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updateDto);

    expect(res.status).toBe(200);
    expect(res.body.description).toBe('New description');

    const updated = await userEquipamentModel.findOne({ userId, equipamentId: eq._id });
    expect(updated!.description).toBe('New description');
  });

  it('DELETE /equipament/:id deve remover da coleção do usuário', async () => {
    const eq = await equipamentModel.create({
      type: 'GRINDER', name: 'To Delete', model: 'M', brand: 'B', createdById: userId
    });
    
    await userEquipamentModel.create({ userId, equipamentId: eq._id });

    const res = await request(app.getHttpServer())
      .delete(`/equipament/${eq._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({});

    expect(res.status).toBe(204);

    const exists = await userEquipamentModel.findOne({ userId, equipamentId: eq._id });
    expect(exists).toBeNull();
  });
});
