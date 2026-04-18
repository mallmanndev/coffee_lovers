import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

@Schema({ _id: false })
class ProcessingDocument {
  @Prop()
  processing_method?: string;

  @Prop()
  fermentation_details?: string;

  @Prop()
  drying_method?: string;
}

@Schema({ _id: false })
class RoastDocument {
  @Prop()
  roast_profile?: string;
}

@Schema({ _id: false })
class SensoryProfileDocument {
  @Prop()
  notes?: string;

  @Prop()
  acidity?: string;

  @Prop()
  body?: string;

  @Prop()
  sweetness?: string;

  @Prop()
  finish?: string;

  @Prop({ type: Number, default: null })
  sca_score?: number | null;
}

@Schema({ timestamps: true, collection: 'coffees' })
export class CoffeeDocument {
  _id!: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  coffee_name!: string;

  @Prop()
  producer_farm?: string;

  @Prop({ required: true })
  roastery!: string;

  @Prop()
  origin_country?: string;

  @Prop()
  region?: string;

  @Prop({ type: Number, default: null })
  altitude_meters?: number | null;

  @Prop()
  variety?: string;

  @Prop({ type: ProcessingDocument })
  processing?: ProcessingDocument;

  @Prop({ type: RoastDocument })
  roast?: RoastDocument;

  @Prop({ type: SensoryProfileDocument })
  sensory_profile?: SensoryProfileDocument;

  @Prop({ required: true, index: true })
  userId!: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const CoffeeSchema: MongooseSchema =
  SchemaFactory.createForClass(CoffeeDocument);
