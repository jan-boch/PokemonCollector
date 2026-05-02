import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Home from '../../pages/index';
import type { User } from '@supabase/supabase-js';
import type { List, Card } from '../../lib/types';
import { supabase } from '../../lib/supabaseClient';

jest.mock('../../lib/supabaseClient', () => ({
    supabase: {
        from: jest.fn(),
    },
}));

jest.mock('next/router', () => ({
    useRouter: () => ({ push: jest.fn() }),
}));

// CardGrid uses dnd-kit — mock it for simple rendering
jest.mock('../../components/CardGrid', () =>
    function MockCardGrid({ initialCards }: { initialCards: Card[] }) {
        return (
            <div data-testid="card-grid">
                {initialCards.map(c => (
                    <div key={c.id} data-testid="card-item">{c.name}</div>
                ))}
            </div>
        );
    }
);

const mockFrom = jest.mocked(supabase.from);

const mockUser = { id: 'user-1', email: 'test@example.com' } as User;
const mockLists: List[] = [{ id: 'list-1', name: 'Base' }];

const makeCard = (id: string, name: string, overrides: Partial<Card> = {}): Card => ({
    id,
    name,
    set_name: null,
    price: null,
    cardmarket_url: null,
    image_path: null,
    list_id: 'list-1',
    user_id: 'user-1',
    collected: false,
    created_at: '2024-01-01T00:00:00Z',
    position: 0,
    ...overrides,
});

const defaultProps = {
    mode: 'view' as const,
    activeList: 'Base',
    lists: mockLists,
    listsLoading: false,
};

describe('Home (index page)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows welcome message when user is not logged in', () => {
        render(<Home {...defaultProps} user={null} />);
        expect(screen.getByText(/Pokémon Card Tracker/i)).toBeInTheDocument();
    });

    it('shows loading spinner while lists are loading', () => {
        render(<Home {...defaultProps} user={mockUser} listsLoading={true} />);
        // loading starts true and stays true because loadData returns early when listsLoading
        expect(screen.getByText(/Loading your collection/i)).toBeInTheDocument();
    });

    it('shows empty state when the list has no cards', async () => {
        mockFrom.mockReturnValue({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    order: jest.fn().mockResolvedValue({ data: [], error: null }),
                }),
            }),
        } as unknown as ReturnType<typeof supabase.from>);

        render(<Home {...defaultProps} user={mockUser} />);

        await waitFor(() => {
            expect(screen.getByText(/No cards yet/i)).toBeInTheDocument();
        });
    });

    it('renders CardGrid with fetched cards', async () => {
        const cards = [makeCard('c1', 'Pikachu'), makeCard('c2', 'Bulbasaur')];
        mockFrom.mockReturnValue({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    order: jest.fn().mockResolvedValue({ data: cards, error: null }),
                }),
            }),
        } as unknown as ReturnType<typeof supabase.from>);

        render(<Home {...defaultProps} user={mockUser} />);

        await waitFor(() => {
            expect(screen.getByTestId('card-grid')).toBeInTheDocument();
        });
        expect(screen.getByText('Pikachu')).toBeInTheDocument();
        expect(screen.getByText('Bulbasaur')).toBeInTheDocument();
    });

    it('shows empty state when activeList is empty string', async () => {
        render(<Home {...defaultProps} user={mockUser} activeList="" />);

        await waitFor(() => {
            expect(screen.getByText(/No cards yet/i)).toBeInTheDocument();
        });
        expect(mockFrom).not.toHaveBeenCalled();
    });

    it('shows empty state when lists array is empty', async () => {
        render(<Home {...defaultProps} user={mockUser} lists={[]} />);

        await waitFor(() => {
            expect(screen.getByText(/No cards yet/i)).toBeInTheDocument();
        });
        expect(mockFrom).not.toHaveBeenCalled();
    });
});

describe('Home — sort controls', () => {
    const cards = [
        makeCard('c1', 'Pikachu',   { price: 5,  collected: false, created_at: '2024-01-01T00:00:00Z', position: 0 }),
        makeCard('c2', 'Charizard', { price: 20, collected: true,  created_at: '2024-03-01T00:00:00Z', position: 1 }),
        makeCard('c3', 'Bulbasaur', { price: 3,  collected: true,  created_at: '2024-02-01T00:00:00Z', position: 2 }),
    ];

    function mockCards(data: Card[]) {
        mockFrom.mockReturnValue({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    order: jest.fn().mockResolvedValue({ data, error: null }),
                }),
            }),
        } as unknown as ReturnType<typeof supabase.from>);
    }

    beforeEach(() => {
        jest.clearAllMocks();
        mockCards(cards);
    });

    async function renderAndWait() {
        render(<Home {...defaultProps} user={mockUser} />);
        await waitFor(() => expect(screen.getByTestId('card-grid')).toBeInTheDocument());
    }

    it('shows "Custom" as the default sort label', async () => {
        await renderAndWait();
        expect(screen.getByRole('button', { name: /Custom/i })).toBeInTheDocument();
    });

    it('opens the sort dropdown and shows all options', async () => {
        await renderAndWait();
        fireEvent.click(screen.getByRole('button', { name: /Custom/i }));
        for (const label of ['Custom', 'Name', 'Set', 'Price', 'Collected', 'Date Added']) {
            expect(screen.getAllByText(label).length).toBeGreaterThan(0);
        }
    });

    it('closes the dropdown and updates label after selecting a sort', async () => {
        await renderAndWait();
        fireEvent.click(screen.getByRole('button', { name: /Custom/i }));
        fireEvent.click(screen.getAllByText('Name')[0]);
        expect(screen.getByRole('button', { name: /Name/i })).toBeInTheDocument();
        expect(screen.queryByText('Date Added')).not.toBeInTheDocument();
    });

    it('shows direction toggle only when a non-Custom sort is active', async () => {
        await renderAndWait();
        expect(screen.queryByTitle(/Ascending|Descending/)).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /Custom/i }));
        fireEvent.click(screen.getAllByText('Price')[0]);
        expect(screen.getByTitle(/Ascending|Descending/)).toBeInTheDocument();
    });

    it('toggles direction label between Ascending and Descending', async () => {
        await renderAndWait();
        fireEvent.click(screen.getByRole('button', { name: /Custom/i }));
        fireEvent.click(screen.getAllByText('Price')[0]);

        const toggle = screen.getByTitle('Ascending');
        fireEvent.click(toggle);
        expect(screen.getByTitle('Descending')).toBeInTheDocument();
    });

    it('passes cards sorted by name asc to CardGrid', async () => {
        await renderAndWait();
        fireEvent.click(screen.getByRole('button', { name: /Custom/i }));
        fireEvent.click(screen.getAllByText('Name')[0]);

        const items = screen.getAllByTestId('card-item');
        expect(items.map(el => el.textContent)).toEqual(['Bulbasaur', 'Charizard', 'Pikachu']);
    });

    it('passes cards sorted by name desc to CardGrid after toggling direction', async () => {
        await renderAndWait();
        fireEvent.click(screen.getByRole('button', { name: /Custom/i }));
        fireEvent.click(screen.getAllByText('Name')[0]);
        fireEvent.click(screen.getByTitle('Ascending'));

        const items = screen.getAllByTestId('card-item');
        expect(items.map(el => el.textContent)).toEqual(['Pikachu', 'Charizard', 'Bulbasaur']);
    });

    it('passes cards in original order when sort is Custom', async () => {
        await renderAndWait();
        // Switch to name sort then back to Custom
        fireEvent.click(screen.getByRole('button', { name: /Custom/i }));
        fireEvent.click(screen.getAllByText('Name')[0]);
        fireEvent.click(screen.getByRole('button', { name: /Name/i }));
        fireEvent.click(screen.getAllByText('Custom')[0]);

        const items = screen.getAllByTestId('card-item');
        expect(items.map(el => el.textContent)).toEqual(['Pikachu', 'Charizard', 'Bulbasaur']);
    });
});
