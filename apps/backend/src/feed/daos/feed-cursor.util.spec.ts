import { BadRequestException } from '@nestjs/common';
import { decodeCursor, encodeCursor } from './feed-cursor.util';

describe('feed-cursor', () => {
  it('roundtrips', () => {
    const d = new Date('2020-01-15T10:00:00.000Z');
    const id = '60d0fe4f5311236168a109ca';
    const c = encodeCursor(d, id);
    expect(decodeCursor(c)).toEqual({ t: d.getTime(), i: id });
  });

  it('throws on invalid', () => {
    expect(() => decodeCursor('not-base64!')).toThrow(BadRequestException);
  });
});
