import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EquipamentDocument } from '../src/equipament/schemas/equipament.schema';
import { UserEquipamentDocument } from '../src/equipament/schemas/user-equipament.schema';
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

    equipamentModel = moduleFixture.get<Model<EquipamentDocument>>(
      getModelToken(EquipamentDocument.name),
    );
    userEquipamentModel = moduleFixture.get<Model<UserEquipamentDocument>>(
      getModelToken(UserEquipamentDocument.name),
    );
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

    const res = await request(app.getHttpServer() as string)
      .post('/equipament')
      .set('Authorization', `Bearer ${authToken}`)
      .send(dto);

    expect(res.status).toBe(201);
    const body = res.body as {
      name: string;
      userEquipamentId: string;
      typeSpecificData: { clicks: number };
    };
    expect(body.name).toBe(dto.name);
    expect(body.userEquipamentId).toBeDefined();
    expect(body.typeSpecificData.clicks).toBe(25);

    // Verificar no banco
    const dbEquipament = await equipamentModel.findOne({ name: dto.name });
    expect(dbEquipament).toBeDefined();

    const dbUserEq = await userEquipamentModel.findOne({ userId });
    expect(dbUserEq).toBeDefined();
    expect(dbUserEq!.equipamentId.toString()).toBe(
      dbEquipament!._id.toString(),
    );
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

    const res = await request(app.getHttpServer() as string)
      .post('/equipament')
      .set('Authorization', `Bearer ${authToken}`)
      .send(dto);

    expect(res.status).toBe(201);
    const body = res.body as {
      id: string;
      name: string;
      typeSpecificData: { pressure: string; portafilterSize: string };
    };
    expect(body.id).toBe(baseEquipament._id.toString());
    expect(body.name).toBe('Gaggia Classic'); // Nome original do banco
    expect(body.typeSpecificData.pressure).toBe('9bar'); // Dado novo do UserEquipament
    expect(body.typeSpecificData.portafilterSize).toBe('58mm'); // Dado herdado da Base
  });

  it('GET /equipament deve listar equipamentos do catálogo', async () => {
    await equipamentModel.create([
      {
        type: 'GRINDER',
        name: 'Eq 1',
        model: 'M1',
        brand: 'B1',
        createdById: userId,
      },
      {
        type: 'SCALE',
        name: 'Eq 2',
        model: 'M2',
        brand: 'B2',
        createdById: 'base',
      },
      {
        type: 'KETTLE',
        name: 'Eq 3',
        model: 'M3',
        brand: 'B3',
        createdById: 'another-user-id',
      },
    ]);

    const res = await request(app.getHttpServer() as string)
      .get('/equipament')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body as unknown[]).toHaveLength(2);
  });

  it('GET /equipament deve filtrar por texto em nome e descrição', async () => {
    await equipamentModel.create([
      {
        type: 'GRINDER',
        name: 'Comandante C40',
        model: 'MK4',
        brand: 'Comandante',
        description: 'Moedor premium',
        createdById: userId,
      },
      {
        type: 'SCALE',
        name: 'Acaia Pearl',
        model: '2021',
        brand: 'Acaia',
        description: 'Precisao para espresso',
        createdById: 'base',
      },
      {
        type: 'KETTLE',
        name: 'Hario Buono',
        model: 'V60',
        brand: 'Hario',
        description: 'Chaleira de bico fino',
        createdById: userId,
      },
    ]);

    const byName = await request(app.getHttpServer() as string)
      .get('/equipament')
      .query({ text: 'comandante' })
      .set('Authorization', `Bearer ${authToken}`);

    expect(byName.status).toBe(200);
    expect(byName.body as unknown[]).toHaveLength(1);
    expect((byName.body as { name: string }[])[0].name).toBe('Comandante C40');

    const byDescription = await request(app.getHttpServer() as string)
      .get('/equipament')
      .query({ text: 'espresso' })
      .set('Authorization', `Bearer ${authToken}`);

    expect(byDescription.status).toBe(200);
    expect(byDescription.body as unknown[]).toHaveLength(1);
    expect((byDescription.body as { name: string }[])[0].name).toBe(
      'Acaia Pearl',
    );
  });

  it('GET /equipament?userOnly=true deve retornar somente equipamentos do usuário autenticado', async () => {
    await equipamentModel.create([
      {
        type: 'GRINDER',
        name: 'User grinder',
        model: 'M1',
        brand: 'B1',
        createdById: userId,
      },
      {
        type: 'SCALE',
        name: 'Base scale',
        model: 'M2',
        brand: 'B2',
        createdById: 'base',
      },
      {
        type: 'KETTLE',
        name: 'Other kettle',
        model: 'M3',
        brand: 'B3',
        createdById: 'another-user-id',
      },
    ]);

    const res = await request(app.getHttpServer() as string)
      .get('/equipament')
      .query({ userOnly: true })
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body as unknown[]).toHaveLength(1);
    expect((res.body as { name: string }[])[0].name).toBe('User grinder');
  });

  it('GET /equipament com userOnly=false deve retornar somente base + usuário atual', async () => {
    await equipamentModel.create([
      {
        type: 'GRINDER',
        name: 'User grinder',
        model: 'M1',
        brand: 'B1',
        createdById: userId,
      },
      {
        type: 'SCALE',
        name: 'Base scale',
        model: 'M2',
        brand: 'B2',
        createdById: 'base',
      },
      {
        type: 'KETTLE',
        name: 'Other kettle',
        model: 'M3',
        brand: 'B3',
        createdById: 'another-user-id',
      },
    ]);

    const res = await request(app.getHttpServer() as string)
      .get('/equipament')
      .query({ userOnly: false })
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body as unknown[]).toHaveLength(2);
    const returnedNames = (res.body as { name: string }[]).map(
      (item) => item.name,
    );
    expect(returnedNames).toEqual(
      expect.arrayContaining(['User grinder', 'Base scale']),
    );
    expect(returnedNames).not.toContain('Other kettle');
  });

  it('GET /equipament/:id deve retornar detalhes e posse do usuário', async () => {
    const eq = await equipamentModel.create({
      type: 'GRINDER',
      name: 'Details',
      model: 'M',
      brand: 'B',
      createdById: userId,
    });

    const res = await request(app.getHttpServer() as string)
      .get(`/equipament/${eq._id.toString()}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    const body = res.body as { id: string };
    expect(body.id).toBe(eq._id.toString());
  });

  it('PUT /equipament/:id deve atualizar dados personalizados', async () => {
    const eq = await equipamentModel.create({
      type: 'GRINDER',
      name: 'To Update',
      model: 'M',
      brand: 'B',
      createdById: userId,
    });

    await userEquipamentModel.create({
      userId,
      equipamentId: eq._id.toString(),
      description: 'Old desc',
    });

    const updateDto = { description: 'New description' };

    const res = await request(app.getHttpServer() as string)
      .put(`/equipament/${eq._id.toString()}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updateDto);

    expect(res.status).toBe(200);
    expect((res.body as { description: string }).description).toBe(
      'New description',
    );

    const updated = await userEquipamentModel.findOne({
      userId,
      equipamentId: eq._id.toString(),
    });
    expect(updated!.description).toBe('New description');
  });

  it('DELETE /equipament/:id deve remover da coleção do usuário', async () => {
    const eq = await equipamentModel.create({
      type: 'GRINDER',
      name: 'To Delete',
      model: 'M',
      brand: 'B',
      createdById: userId,
    });

    await userEquipamentModel.create({
      userId,
      equipamentId: eq._id.toString(),
    });

    const res = await request(app.getHttpServer() as string)
      .delete(`/equipament/${eq._id.toString()}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({});

    expect(res.status).toBe(204);

    const exists = await userEquipamentModel.findOne({
      userId,
      equipamentId: eq._id.toString(),
    });
    expect(exists).toBeNull();
  });
});
