export type EquipamentProps = {
  id?: string;
  type: string;
  name: string;
  model: string;
  brand: string;
  description?: string;
  photos?: string[];
  createdById: string;
  typeSpecificData?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
};

export class Equipament {
  private constructor(
    private readonly id: string | null,
    private readonly type: string,
    private readonly name: string,
    private readonly model: string,
    private readonly brand: string,
    private readonly description: string | null,
    private readonly photos: string[],
    private readonly createdById: string,
    private readonly typeSpecificData: Record<string, any>,
    private readonly createdAt: Date,
    private readonly updatedAt: Date,
  ) {}

  static create(props: EquipamentProps): Equipament {
    return new Equipament(
      props.id || null,
      props.type,
      props.name,
      props.model,
      props.brand,
      props.description || null,
      props.photos || [],
      props.createdById,
      props.typeSpecificData || {},
      props.createdAt || new Date(),
      props.updatedAt || new Date(),
    );
  }

  getId(): string | null {
    return this.id;
  }
  getType(): string {
    return this.type;
  }
  getName(): string {
    return this.name;
  }
  getModel(): string {
    return this.model;
  }
  getBrand(): string {
    return this.brand;
  }
  getDescription(): string | null {
    return this.description;
  }
  getPhotos(): string[] {
    return this.photos;
  }
  getCreatedById(): string {
    return this.createdById;
  }
  getTypeSpecificData(): Record<string, any> {
    return this.typeSpecificData;
  }
  getCreatedAt(): Date {
    return this.createdAt;
  }
  getUpdatedAt(): Date {
    return this.updatedAt;
  }
}
