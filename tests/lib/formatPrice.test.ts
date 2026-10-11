import { describe, expect, it } from 'vitest';
import { formatPrice } from '../../src/lib/formatPrice.ts';

describe('formatPrice', () => {
  it('formata valores em reais com duas casas decimais', () => {
    expect(formatPrice(14.9).replaceAll('\u00a0', ' ')).toBe('R$ 14,90');
    expect(formatPrice(1234.5).replaceAll('\u00a0', ' ')).toBe('R$ 1.234,50');
  });
});
