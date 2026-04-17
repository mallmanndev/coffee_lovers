import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Equipament } from '../domain/equipament.entity';
import { EquipamentDocument } from '../schemas/equipament.schema';
import { EquipamentRepository } from './equipament.repository';

@Injectable()
export class MongooseEquipamentRepository implements EquipamentRepository {
  constructor(
    @InjectModel(EquipamentDocument.name)
    private readonly equipamentModel: Model<EquipamentDocument>,
  ) {}

  async create(equipament: Equipament): Promise<Equipament> {
    const created = new this.equipamentModel({
      type: equipament.getType(),
      name: equipament.getName(),
      model: equipament.getModel(),
      brand: equipament.getBrand(),
      description: equipament.getDescription(),
      photos: equipament.getPhotos(),
      createdById: equipament.getCreatedById(),
      typeSpecificData: equipament.getTypeSpecificData(),
    });

    const doc = await created.save();
    return this.mapToEntity(doc);
  }

  async findById(id: string): Promise<Equipament | null> {
    const doc = await this.equipamentModel.findById(id).exec();
    return doc ? this.mapToEntity(doc) : null;
  }

  async findAll(filters?: { type?: string }): Promise<Equipament[]> {
    const query = filters?.type ? { type: filters.type } : {};
    const docs = await this.equipamentModel.find(query).sort({ createdAt: -1 }).exec();
    return docs.map(doc => this.mapToEntity(doc));
  }

  private mapToEntity(doc: EquipamentDocument): Equipament {
    return Equipament.create({
      id: doc._id.toString(),
      type: doc.type,
      name: doc.name,
      model: doc.model,
      brand: doc.brand,
      description: doc.description,
      photos: doc.photos,
      createdById: doc.createdById,
      typeSpecificData: doc.typeSpecificData,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
