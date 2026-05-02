import { sortCards } from '../../lib/sortCards';
import type { Card } from '../../lib/types';

const makeCard = (overrides: Partial<Card> = {}): Card => ({
    id: 'c1',
    name: 'Pikachu',
    set_name: 'Base Set',
    price: 10,
    cardmarket_url: null,
    image_path: null,
    list_id: 'list-1',
    user_id: 'user-1',
    collected: false,
    created_at: '2024-01-01T00:00:00Z',
    position: 0,
    ...overrides,
});

const pikachu  = makeCard({ id: 'c1', name: 'Pikachu',   set_name: 'Base Set',     price: 5,    collected: false, created_at: '2024-01-01T00:00:00Z', position: 0 });
const charizard = makeCard({ id: 'c2', name: 'Charizard', set_name: 'Jungle',       price: 20,   collected: true,  created_at: '2024-03-01T00:00:00Z', position: 1 });
const mewtwo    = makeCard({ id: 'c3', name: 'Mewtwo',    set_name: 'Fossil',       price: null, collected: false, created_at: '2024-02-01T00:00:00Z', position: 2 });
const bulbasaur = makeCard({ id: 'c4', name: 'Bulbasaur', set_name: 'Base Set',     price: 3,    collected: true,  created_at: '2024-04-01T00:00:00Z', position: 3 });

const cards = [pikachu, charizard, mewtwo, bulbasaur];

describe('sortCards', () => {
    describe('position (Custom)', () => {
        it('returns the same array reference unchanged', () => {
            const result = sortCards(cards, 'position', 'asc');
            expect(result).toBe(cards);
        });

        it('ignores sortDir and returns original order', () => {
            expect(sortCards(cards, 'position', 'desc')).toBe(cards);
        });
    });

    describe('name', () => {
        it('sorts ascending (A→Z)', () => {
            const result = sortCards(cards, 'name', 'asc');
            expect(result.map(c => c.name)).toEqual(['Bulbasaur', 'Charizard', 'Mewtwo', 'Pikachu']);
        });

        it('sorts descending (Z→A)', () => {
            const result = sortCards(cards, 'name', 'desc');
            expect(result.map(c => c.name)).toEqual(['Pikachu', 'Mewtwo', 'Charizard', 'Bulbasaur']);
        });

        it('does not mutate the original array', () => {
            const original = [...cards];
            sortCards(cards, 'name', 'asc');
            expect(cards).toEqual(original);
        });
    });

    describe('set_name', () => {
        it('sorts ascending (A→Z)', () => {
            const result = sortCards(cards, 'set_name', 'asc');
            const sets = result.map(c => c.set_name);
            expect(sets[0]).toBe('Base Set');
            expect(sets[1]).toBe('Base Set');
            expect(sets[2]).toBe('Fossil');
            expect(sets[3]).toBe('Jungle');
        });

        it('sorts descending (Z→A)', () => {
            const result = sortCards(cards, 'set_name', 'desc');
            expect(result[0].set_name).toBe('Jungle');
            expect(result[3].set_name).toBe('Base Set');
        });
    });

    describe('price', () => {
        it('sorts ascending (low→high), nulls last', () => {
            const result = sortCards(cards, 'price', 'asc');
            expect(result.map(c => c.price)).toEqual([3, 5, 20, null]);
        });

        it('sorts descending (high→low), nulls last', () => {
            const result = sortCards(cards, 'price', 'desc');
            expect(result.map(c => c.price)).toEqual([20, 5, 3, null]);
        });

        it('keeps two null prices together', () => {
            const a = makeCard({ id: 'a', name: 'A', price: null });
            const b = makeCard({ id: 'b', name: 'B', price: null });
            const c = makeCard({ id: 'c', name: 'C', price: 1 });
            const result = sortCards([a, b, c], 'price', 'asc');
            expect(result[0].price).toBe(1);
            expect(result[1].price).toBeNull();
            expect(result[2].price).toBeNull();
        });
    });

    describe('collected', () => {
        it('sorts ascending: uncollected first', () => {
            const result = sortCards(cards, 'collected', 'asc');
            const collected = result.map(c => c.collected);
            expect(collected[0]).toBe(false);
            expect(collected[1]).toBe(false);
            expect(collected[2]).toBe(true);
            expect(collected[3]).toBe(true);
        });

        it('sorts descending: collected first', () => {
            const result = sortCards(cards, 'collected', 'desc');
            const collected = result.map(c => c.collected);
            expect(collected[0]).toBe(true);
            expect(collected[1]).toBe(true);
            expect(collected[2]).toBe(false);
            expect(collected[3]).toBe(false);
        });
    });

    describe('created_at', () => {
        it('sorts ascending (oldest first)', () => {
            const result = sortCards(cards, 'created_at', 'asc');
            expect(result.map(c => c.id)).toEqual(['c1', 'c3', 'c2', 'c4']);
        });

        it('sorts descending (newest first)', () => {
            const result = sortCards(cards, 'created_at', 'desc');
            expect(result.map(c => c.id)).toEqual(['c4', 'c2', 'c3', 'c1']);
        });
    });

    describe('edge cases', () => {
        it('returns empty array unchanged', () => {
            expect(sortCards([], 'name', 'asc')).toEqual([]);
        });

        it('returns single-card array unchanged', () => {
            expect(sortCards([pikachu], 'price', 'desc')).toEqual([pikachu]);
        });
    });
});
