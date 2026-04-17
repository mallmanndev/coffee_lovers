import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Equipment } from '../domain/equipment.entity';
import { EquipmentDocument } from '../schemas/equipment.schema';
import { EquipmentRepository } from './equipment.repository';

@Injectable()
export class MongooseEquipmentRepository implements EquipmentRepository {
  constructor(
    @InjectModel(EquipmentDocument.name)
    private readonly equipmentModel: Model<EquipmentDocument>,
  ) {}

  async create(equipment: Equipment): Promise<Equipment> {
    const created = new this.equipmentModel({
      type: equipment.getType(),
      name: equipment.getName(),
      model: equipment.getModel(),
      brand: equipment.getBrand(),
      description: equipment.getDescription(),
      photos: equipment.getPhotos(),
      createdById: equipment.getCreatedById(),
      typeSpecificData: equipment.getTypeSpecificData(),
    });

    const doc = await created.save();
    return this.mapToEntity(doc);
  }

  async findById(id: string): Promise<Equipment | null> {
    const doc = await this.equipmentModel.findById(id).exec();
    return doc ? this.mapToEntity(doc) : null;
  }

  async findAll(filters?: { type?: string }): Promise<Equipment[]> {
    const query = filters?.type ? { type: filters.type } : {};
    const docs = await this.equipmentModel.find(query).sort({ createdAt: -1 }).exec();
    return docs.map(doc => this.mapToEntity(doc));
  }

  private mapToEntity(doc: EquipmentDocument): Equipment {
    return Equipment.create({
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
