import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

export type CursorV1 = { t: number; i: string };

export function encodeCursor(createdAt: Date, id: string): string {
  const payload: CursorV1 = { t: createdAt.getTime(), i: id };
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
}

export function decodeCursor(raw: string): CursorV1 {
  try {
    const json = Buffer.from(raw, 'base64url').toString('utf8');
    const o = JSON.parse(json) as CursorV1;
    if (typeof o.t !== 'number' || typeof o.i !== 'string') {
      throw new Error();
    }
    if (!Types.ObjectId.isValid(o.i)) {
      throw new Error();
    }
    return o;
  } catch {
    throw new BadRequestException('cursor inválido');
  }
}
