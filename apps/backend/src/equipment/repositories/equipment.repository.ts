import { Equipment } from '../domain/equipment.entity';

export abstract class EquipmentRepository {
  abstract create(equipment: Equipment): Promise<Equipment>;
  abstract findById(id: string): Promise<Equipment | null>;
  abstract findAll(filters?: { type?: string }): Promise<Equipment[]>;
}
