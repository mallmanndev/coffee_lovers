import { BadRequestException } from '@nestjs/common';

export type StockItemProps = {
  id?: string;
  coffeeId: string;
  userId: string;
  quantity: number;
  roastDate: Date;
  freezingDate?: Date;
  code: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export class StockItem {
  private constructor(
    private readonly id: string | null,
    private readonly coffeeId: string,
    private readonly userId: string,
    private readonly quantity: number,
    private readonly roastDate: Date,
    private readonly freezingDate: Date | null,
    private readonly code: string,
    private readonly createdAt: Date | null,
    private readonly updatedAt: Date | null,
  ) {}

  static create(props: StockItemProps): StockItem {
    if (!props.coffeeId) {
      throw new BadRequestException('coffeeId is required');
    }
    if (!props.userId) {
      throw new BadRequestException('userId is required');
    }
    if (props.quantity <= 0) {
      throw new BadRequestException('quantity must be positive');
    }
    if (!props.roastDate) {
      throw new BadRequestException('roastDate is required');
    }
    if (!props.code || props.code.trim() === '') {
      throw new BadRequestException('code is required');
    }

    return new StockItem(
      props.id || null,
      props.coffeeId,
      props.userId,
      props.quantity,
      props.roastDate,
      props.freezingDate || null,
      props.code.trim(),
      props.createdAt || null,
      props.updatedAt || null,
    );
  }

  get getId(): string | null {
    return this.id;
  }

  get getCoffeeId(): string {
    return this.coffeeId;
  }

  get getUserId(): string {
    return this.userId;
  }

  get getQuantity(): number {
    return this.quantity;
  }

  get getRoastDate(): Date {
    return this.roastDate;
  }

  get getFreezingDate(): Date | null {
    return this.freezingDate;
  }

  get getCode(): string {
    return this.code;
  }

  get getCreatedAt(): Date | null {
    return this.createdAt;
  }

  get getUpdatedAt(): Date | null {
    return this.updatedAt;
  }
}
