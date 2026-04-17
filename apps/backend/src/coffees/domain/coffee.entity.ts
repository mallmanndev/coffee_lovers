import { BadRequestException } from '@nestjs/common';

export type CoffeeProcessing = {
  processing_method?: string;
  fermentation_details?: string;
  drying_method?: string;
};

export type CoffeeRoast = {
  roast_profile?: string;
};

export type CoffeeSensoryProfile = {
  notes?: string;
  acidity?: string;
  body?: string;
  sweetness?: string;
  finish?: string;
  sca_score?: number | null;
};

export type CoffeeProps = {
  id?: string;
  coffee_name: string;
  producer_farm?: string;
  roastery: string;
  origin_country?: string;
  region?: string;
  altitude_meters?: number | null;
  variety?: string;
  processing?: CoffeeProcessing;
  roast?: CoffeeRoast;
  sensory_profile?: CoffeeSensoryProfile;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export class Coffee {
  private constructor(
    private readonly id: string | null,
    private readonly coffeeName: string,
    private readonly producerFarm: string | null,
    private readonly roastery: string,
    private readonly originCountry: string | null,
    private readonly region: string | null,
    private readonly altitudeMeters: number | null,
    private readonly variety: string | null,
    private readonly processing: CoffeeProcessing | null,
    private readonly roast: CoffeeRoast | null,
    private readonly sensoryProfile: CoffeeSensoryProfile | null,
    private readonly userId: string,
    private readonly createdAt: Date,
    private readonly updatedAt: Date,
  ) {}

  static create(props: CoffeeProps): Coffee {
    this.validateRequiredText('coffee_name', props.coffee_name);
    this.validateRequiredText('roastery', props.roastery);
    this.validateRequiredText('userId', props.userId);

    if (props.altitude_meters !== undefined && props.altitude_meters !== null) {
      if (!Number.isFinite(props.altitude_meters) || props.altitude_meters < 0 || props.altitude_meters > 10000) {
        throw new BadRequestException('altitude_meters must be between 0 and 10000 when provided');
      }
    }

    this.validateOptionalText('producer_farm', props.producer_farm);
    this.validateOptionalText('origin_country', props.origin_country);
    this.validateOptionalText('region', props.region);
    this.validateOptionalText('variety', props.variety);
    this.validateProcessing(props.processing);
    this.validateRoast(props.roast);
    this.validateSensoryProfile(props.sensory_profile);

    return new Coffee(
      props.id || null,
      props.coffee_name.trim(),
      props.producer_farm?.trim() || null,
      props.roastery.trim(),
      props.origin_country?.trim() || null,
      props.region?.trim() || null,
      props.altitude_meters ?? null,
      props.variety?.trim() || null,
      props.processing
        ? {
            processing_method: props.processing.processing_method?.trim(),
            fermentation_details: props.processing.fermentation_details?.trim(),
            drying_method: props.processing.drying_method?.trim(),
          }
        : null,
      props.roast
        ? {
            roast_profile: props.roast.roast_profile?.trim(),
          }
        : null,
      props.sensory_profile
        ? {
            notes: props.sensory_profile.notes?.trim(),
            acidity: props.sensory_profile.acidity?.trim(),
            body: props.sensory_profile.body?.trim(),
            sweetness: props.sensory_profile.sweetness?.trim(),
            finish: props.sensory_profile.finish?.trim(),
            sca_score: props.sensory_profile.sca_score ?? null,
          }
        : null,
      props.userId.trim(),
      props.createdAt || new Date(),
      props.updatedAt || new Date(),
    );
  }

  private static validateRequiredText(field: string, value: string) {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new BadRequestException(`${field} is required`);
    }
  }

  private static validateOptionalText(field: string, value?: string) {
    if (value !== undefined && (typeof value !== 'string' || value.trim().length === 0)) {
      throw new BadRequestException(`${field} cannot be empty when provided`);
    }
  }

  private static validateProcessing(processing?: CoffeeProcessing) {
    if (!processing) return;
    if (processing.processing_method !== undefined) {
      this.validateOptionalText('processing.processing_method', processing.processing_method);
    }
    if (processing.fermentation_details !== undefined) {
      this.validateOptionalText('processing.fermentation_details', processing.fermentation_details);
    }
    if (processing.drying_method !== undefined) {
      this.validateOptionalText('processing.drying_method', processing.drying_method);
    }
  }

  private static validateRoast(roast?: CoffeeRoast) {
    if (!roast) return;
    if (roast.roast_profile !== undefined) {
      this.validateOptionalText('roast.roast_profile', roast.roast_profile);
    }
  }

  private static validateSensoryProfile(sensoryProfile?: CoffeeSensoryProfile) {
    if (!sensoryProfile) return;
    this.validateOptionalText('sensory_profile.notes', sensoryProfile.notes);
    this.validateOptionalText('sensory_profile.acidity', sensoryProfile.acidity);
    this.validateOptionalText('sensory_profile.body', sensoryProfile.body);
    this.validateOptionalText('sensory_profile.sweetness', sensoryProfile.sweetness);
    this.validateOptionalText('sensory_profile.finish', sensoryProfile.finish);

    if (sensoryProfile.sca_score !== undefined && sensoryProfile.sca_score !== null) {
      if (!Number.isFinite(sensoryProfile.sca_score) || sensoryProfile.sca_score < 0 || sensoryProfile.sca_score > 100) {
        throw new BadRequestException('sca_score must be between 0 and 100 when provided');
      }
    }
  }

  getId(): string | null { return this.id; }
  getCoffeeName(): string { return this.coffeeName; }
  getProducerFarm(): string | null { return this.producerFarm; }
  getRoastery(): string { return this.roastery; }
  getOriginCountry(): string | null { return this.originCountry; }
  getRegion(): string | null { return this.region; }
  getAltitudeMeters(): number | null { return this.altitudeMeters; }
  getVariety(): string | null { return this.variety; }
  getProcessing(): CoffeeProcessing | null { return this.processing; }
  getRoast(): CoffeeRoast | null { return this.roast; }
  getSensoryProfile(): CoffeeSensoryProfile | null { return this.sensoryProfile; }
  getUserId(): string { return this.userId; }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }
}
