import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Coffee } from '../domain/coffee.entity';
import { CoffeeRepository } from './coffee.repository';
import { CoffeeDocument } from '../schemas/coffee.schema';

@Injectable()
export class MongooseCoffeeRepository implements CoffeeRepository {
  constructor(
    @InjectModel(CoffeeDocument.name)
    private readonly coffeeModel: Model<CoffeeDocument>,
  ) {}

  async create(coffee: Coffee): Promise<Coffee> {
    const created = new this.coffeeModel({
      coffee_name: coffee.getCoffeeName(),
      producer_farm: coffee.getProducerFarm(),
      roastery: coffee.getRoastery(),
      origin_country: coffee.getOriginCountry(),
      region: coffee.getRegion(),
      altitude_meters: coffee.getAltitudeMeters(),
      variety: coffee.getVariety(),
      processing: coffee.getProcessing(),
      roast: coffee.getRoast(),
      sensory_profile: coffee.getSensoryProfile(),
      userId: coffee.getUserId(),
    });

    const doc = await created.save();
    return this.mapToEntity(doc);
  }

  async findByIdAndUserId(id: string, userId: string): Promise<Coffee | null> {
    const doc = await this.coffeeModel
      .findOne({ _id: id as any, userId })
      .exec();
    if (!doc) {
      return null;
    }
    return this.mapToEntity(doc);
  }

  private mapToEntity(doc: CoffeeDocument): Coffee {
    const processing = doc.processing
      ? {
          processing_method: doc.processing.processing_method,
          fermentation_details: doc.processing.fermentation_details,
          drying_method: doc.processing.drying_method,
        }
      : undefined;

    const roast = doc.roast
      ? {
          roast_profile: doc.roast.roast_profile,
        }
      : undefined;

    const sensoryProfile = doc.sensory_profile
      ? {
          notes: doc.sensory_profile.notes,
          acidity: doc.sensory_profile.acidity,
          body: doc.sensory_profile.body,
          sweetness: doc.sensory_profile.sweetness,
          finish: doc.sensory_profile.finish,
          sca_score: doc.sensory_profile.sca_score,
        }
      : undefined;

    return Coffee.create({
      id: doc._id.toString(),
      coffee_name: doc.coffee_name,
      producer_farm: doc.producer_farm,
      roastery: doc.roastery,
      origin_country: doc.origin_country,
      region: doc.region,
      altitude_meters: doc.altitude_meters,
      variety: doc.variety,
      processing,
      roast,
      sensory_profile: sensoryProfile,
      userId: doc.userId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
