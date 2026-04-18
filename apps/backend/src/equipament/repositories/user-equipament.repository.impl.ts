import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserEquipament } from '../domain/user-equipament.entity';
import { UserEquipamentDocument } from '../schemas/user-equipament.schema';
import { UserEquipamentRepository } from './user-equipament.repository';

@Injectable()
export class MongooseUserEquipamentRepository implements UserEquipamentRepository {
  constructor(
    @InjectModel(UserEquipamentDocument.name)
    private readonly userEquipamentModel: Model<UserEquipamentDocument>,
  ) {}

  async create(userEquipament: UserEquipament): Promise<UserEquipament> {
    const created = new this.userEquipamentModel({
      equipamentId: userEquipament.getEquipamentId(),
      userId: userEquipament.getUserId(),
      description: userEquipament.getDescription(),
      modifications: userEquipament.getModifications(),
      photos: userEquipament.getPhotos(),
      typeSpecificData: userEquipament.getTypeSpecificData(),
    });

    const doc = await created.save();
    return this.mapToEntity(doc);
  }

  async findById(id: string): Promise<UserEquipament | null> {
    const doc = await this.userEquipamentModel.findById(id).exec();
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByUserIdAndEquipamentId(
    userId: string,
    equipamentId: string,
  ): Promise<UserEquipament | null> {
    const doc = await this.userEquipamentModel
      .findOne({ userId, equipamentId })
      .exec();
    return doc ? this.mapToEntity(doc) : null;
  }

  async update(userEquipament: UserEquipament): Promise<UserEquipament> {
    const doc = await this.userEquipamentModel
      .findByIdAndUpdate(
        userEquipament.getId(),
        {
          description: userEquipament.getDescription(),
          modifications: userEquipament.getModifications(),
          photos: userEquipament.getPhotos(),
          typeSpecificData: userEquipament.getTypeSpecificData(),
        },
        { new: true },
      )
      .exec();

    if (!doc) throw new Error('User equipament not found');
    return this.mapToEntity(doc);
  }

  async delete(userId: string, equipamentId: string): Promise<void> {
    await this.userEquipamentModel.deleteOne({ userId, equipamentId }).exec();
  }

  private mapToEntity(doc: UserEquipamentDocument): UserEquipament {
    return UserEquipament.create({
      id: doc._id.toString(),
      equipamentId: doc.equipamentId,
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
