import { Coffee } from './index';

describe('Shared types', () => {
  it('should allow creating a coffee object', () => {
    const coffee: Coffee = {
      id: '1',
      name: 'Café Especial',
      roaster: 'Torrefação local',
      origin: 'Brasil',
      process: 'Lavado',
      notes: ['Chocolate', 'Caramelo'],
      rating: 5,
    };
    expect(coffee.name).toBe('Café Especial');
  });
});
