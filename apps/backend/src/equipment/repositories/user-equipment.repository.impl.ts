import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserEquipment } from '../domain/user-equipment.entity';
import { UserEquipmentDocument } from '../schemas/user-equipment.schema';
import { UserEquipmentRepository } from './user-equipment.repository';

@Injectable()
export class MongooseUserEquipmentRepository implements UserEquipmentRepository {
  constructor(
    @InjectModel(UserEquipmentDocument.name)
    private readonly userEquipmentModel: Model<UserEquipmentDocument>,
  ) {}

  async create(userEquipment: UserEquipment): Promise<UserEquipment> {
    const created = new this.userEquipmentModel({
      equipmentId: userEquipment.getEquipmentId(),
      userId: userEquipment.getUserId(),
      description: userEquipment.getDescription(),
      modifications: userEquipment.getModifications(),
      photos: userEquipment.getPhotos(),
      typeSpecificData: userEquipment.getTypeSpecificData(),
    });

    const doc = await created.save();
    return this.mapToEntity(doc);
  }

  async findById(id: string): Promise<UserEquipment | null> {
    const doc = await this.userEquipmentModel.findById(id).exec();
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByUserIdAndEquipmentId(userId: string, equipmentId: string): Promise<UserEquipment | null> {
    const doc = await this.userEquipmentModel.findOne({ userId, equipmentId }).exec();
    return doc ? this.mapToEntity(doc) : null;
  }

  async update(userEquipment: UserEquipment): Promise<UserEquipment> {
    const doc = await this.userEquipmentModel.findByIdAndUpdate(
      userEquipment.getId(),
      {
        description: userEquipment.getDescription(),
        modifications: userEquipment.getModifications(),
        photos: userEquipment.getPhotos(),
        typeSpecificData: userEquipment.getTypeSpecificData(),
      },
      { new: true }
    ).exec();

    if (!doc) throw new Error('User equipment not found');
    return this.mapToEntity(doc);
  }

  async delete(userId: string, equipmentId: string): Promise<void> {
    await this.userEquipmentModel.deleteOne({ userId, equipmentId }).exec();
  }

  private mapToEntity(doc: UserEquipmentDocument): UserEquipment {
    return UserEquipment.create({
      id: doc._id.toString(),
      equipmentId: doc.equipmentId,
      userId: doc.userId,
      description: doc.description,
      modifications: doc.modifications,
      photos: doc.photos,
      typeSpecificData: doc.typeSpecificData,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
