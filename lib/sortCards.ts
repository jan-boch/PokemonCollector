import type { Card } from './types';

export type SortField = 'position' | 'name' | 'set_name' | 'price' | 'collected' | 'created_at';

export const SORT_OPTIONS: { value: SortField; label: string }[] = [
    { value: 'position', label: 'Custom' },
    { value: 'name', label: 'Name' },
    { value: 'set_name', label: 'Set' },
    { value: 'price', label: 'Price' },
    { value: 'collected', label: 'Collected' },
    { value: 'created_at', label: 'Date Added' },
];

export function sortCards(cards: Card[], sortBy: SortField, sortDir: 'asc' | 'desc'): Card[] {
    if (sortBy === 'position') return cards;
    return [...cards].sort((a, b) => {
        let cmp = 0;
        switch (sortBy) {
            case 'name':
                cmp = (a.name ?? '').localeCompare(b.name ?? '');
                break;
            case 'set_name':
                cmp = (a.set_name ?? '').localeCompare(b.set_name ?? '');
                break;
            case 'price':
                if (a.price === null && b.price === null) { cmp = 0; break; }
                if (a.price === null) return 1;
                if (b.price === null) return -1;
                cmp = a.price - b.price;
                break;
            case 'collected':
                cmp = Number(a.collected) - Number(b.collected);
                break;
            case 'created_at':
                cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                break;
        }
        return sortDir === 'desc' ? -cmp : cmp;
    });
}
