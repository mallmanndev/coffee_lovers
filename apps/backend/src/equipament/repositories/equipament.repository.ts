import { Equipament } from '../domain/equipament.entity';

export abstract class EquipamentRepository {
  abstract create(equipament: Equipament): Promise<Equipament>;
  abstract findById(id: string): Promise<Equipament | null>;
  abstract findAll(filters?: { type?: string }): Promise<Equipament[]>;
}
