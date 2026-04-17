import { UserEquipament } from '../domain/user-equipament.entity';

export abstract class UserEquipamentRepository {
  abstract create(userEquipament: UserEquipament): Promise<UserEquipament>;
  abstract findById(id: string): Promise<UserEquipament | null>;
  abstract findByUserIdAndEquipamentId(userId: string, equipamentId: string): Promise<UserEquipament | null>;
  abstract update(userEquipament: UserEquipament): Promise<UserEquipament>;
  abstract delete(userId: string, equipamentId: string): Promise<void>;
}
