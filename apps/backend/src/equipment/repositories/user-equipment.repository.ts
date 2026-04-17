import { UserEquipment } from '../domain/user-equipment.entity';

export abstract class UserEquipmentRepository {
  abstract create(userEquipment: UserEquipment): Promise<UserEquipment>;
  abstract findById(id: string): Promise<UserEquipment | null>;
  abstract findByUserIdAndEquipmentId(userId: string, equipmentId: string): Promise<UserEquipment | null>;
  abstract update(userEquipment: UserEquipment): Promise<UserEquipment>;
  abstract delete(userId: string, equipmentId: string): Promise<void>;
}
