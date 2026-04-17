import { BadRequestException } from '@nestjs/common';
import { Coffee, CoffeeProps } from './coffee.entity';

const makeValidProps = (): CoffeeProps => ({
  coffee_name: 'Geisha Reserve',
  producer_farm: 'Finca La Esperanza',
  roastery: 'Roast Lab',
  origin_country: 'Colombia',
  region: 'Huila',
  altitude_meters: 1750,
  variety: 'Geisha',
  processing: {
    processing_method: 'Washed',
    fermentation_details: '48h tank fermentation',
    drying_method: 'Raised beds',
  },
  roast: {
    roast_profile: 'Light roast',
  },
  sensory_profile: {
    notes: 'Jasmine and peach',
    acidity: 'Citric',
    body: 'Silky',
    sweetness: 'High',
    finish: 'Long',
    sca_score: 89,
  },
  userId: 'user-1',
});

describe('Coffee Entity', () => {
  it('should create a coffee entity with valid payload', () => {
    const coffee = Coffee.create(makeValidProps());

    expect(coffee.getCoffeeName()).toBe('Geisha Reserve');
    expect(coffee.getUserId()).toBe('user-1');
    expect(coffee.getSensoryProfile().sca_score).toBe(89);
  });

  it('should reject empty required text fields', () => {
    const invalid = makeValidProps();
    invalid.coffee_name = '   ';

    expect(() => Coffee.create(invalid)).toThrow(BadRequestException);
  });

  it('should reject out-of-range numeric fields', () => {
    const invalidAltitude = makeValidProps();
    invalidAltitude.altitude_meters = -1;
    expect(() => Coffee.create(invalidAltitude)).toThrow(BadRequestException);

    const invalidSca = makeValidProps();
    invalidSca.sensory_profile.sca_score = 120;
    expect(() => Coffee.create(invalidSca)).toThrow(BadRequestException);
  });
});
