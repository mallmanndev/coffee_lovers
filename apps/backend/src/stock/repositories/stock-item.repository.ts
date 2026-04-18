import { StockItem } from '../domain/stock-item.entity';

export abstract class StockItemRepository {
  abstract create(item: StockItem): Promise<StockItem>;
}
