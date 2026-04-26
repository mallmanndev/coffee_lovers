import { Injectable } from '@nestjs/common';
import { CreateCoffeeInput, CreateCoffeeOutput } from '@coffee-lovers/shared';
import { Coffee } from '../domain/coffee.entity';
import { CoffeeRepository } from '../repositories/coffee.repository';

@Injectable()
export class CreateCoffeeUseCase {
  constructor(private readonly coffeeRepository: CoffeeRepository) {}

  async execute(
    dto: CreateCoffeeInput,
    userId: string,
  ): Promise<CreateCoffeeOutput> {
    console.log('DTO:', dto);
    const coffee = Coffee.create({
      ...dto,
      userId,
    });

    const createdCoffee = await this.coffeeRepository.create(coffee);
    const processing = createdCoffee.getProcessing();
    const roast = createdCoffee.getRoast();
    const sensoryProfile = createdCoffee.getSensoryProfile();

    return {
      id: createdCoffee.getId()!,
      coffee_name: createdCoffee.getCoffeeName(),
      producer_farm: createdCoffee.getProducerFarm() ?? undefined,
      roastery: createdCoffee.getRoastery(),
      origin_country: createdCoffee.getOriginCountry() ?? undefined,
      region: createdCoffee.getRegion() ?? undefined,
      altitude_meters: createdCoffee.getAltitudeMeters(),
      variety: createdCoffee.getVariety() ?? undefined,
      photos: createdCoffee.getPhotos(),
      processing: processing
        ? {
            processing_method: processing.processing_method ?? undefined,
            fermentation_details:
              processing.fermentation_details ?? undefined,
            drying_method: processing.drying_method ?? undefined,
          }
        : undefined,
      roast: roast
        ? {
            roast_profile: roast.roast_profile ?? undefined,
          }
        : undefined,
      sensory_profile: sensoryProfile
        ? {
            body: sensoryProfile.body ?? undefined,
            notes: sensoryProfile.notes ?? undefined,
            acidity: sensoryProfile.acidity ?? undefined,
            sweetness: sensoryProfile.sweetness ?? undefined,
            finish: sensoryProfile.finish ?? undefined,
            sca_score: sensoryProfile.sca_score ?? undefined,
          }
        : undefined,
      userId: createdCoffee.getUserId(),
      createdAt: createdCoffee.getCreatedAt().toISOString(),
      updatedAt: createdCoffee.getUpdatedAt().toISOString(),
    };
  }
}
