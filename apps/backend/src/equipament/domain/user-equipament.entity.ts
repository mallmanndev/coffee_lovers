export type UserEquipamentProps = {
  id?: string;
  equipamentId: string;
  userId: string;
  description?: string;
  modifications?: { name: string; description: string }[];
  photos?: string[];
  typeSpecificData?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
};

export class UserEquipament {
  private constructor(
    private readonly id: string | null,
    private readonly equipamentId: string,
    private readonly userId: string,
    private readonly description: string | null,
    private readonly modifications: { name: string; description: string }[],
    private readonly photos: string[],
    private readonly typeSpecificData: Record<string, any>,
    private readonly createdAt: Date,
    private readonly updatedAt: Date,
  ) {}

  static create(props: UserEquipamentProps): UserEquipament {
    return new UserEquipament(
      props.id || null,
      props.equipamentId,
      props.userId,
      props.description || null,
      props.modifications || [],
      props.photos || [],
      props.typeSpecificData || {},
      props.createdAt || new Date(),
      props.updatedAt || new Date(),
    );
  }

  update(props: Partial<Omit<UserEquipamentProps, 'id' | 'equipamentId' | 'userId' | 'createdAt' | 'updatedAt'>>): UserEquipament {
    return new UserEquipament(
      this.id,
      this.equipamentId,
      this.userId,
      props.description !== undefined ? props.description : this.description,
      props.modifications || this.modifications,
      props.photos || this.photos,
      props.typeSpecificData || this.typeSpecificData,
      this.createdAt,
      new Date(),
    );
  }

  getId(): string | null { return this.id; }
  getEquipamentId(): string { return this.equipamentId; }
  getUserId(): string { return this.userId; }
  getDescription(): string | null { return this.description; }
  getModifications(): { name: string; description: string }[] { return this.modifications; }
  getPhotos(): string[] { return this.photos; }
  getTypeSpecificData(): Record<string, any> { return this.typeSpecificData; }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }
}
