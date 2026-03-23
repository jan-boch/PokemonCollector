import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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

const makeCard = (id: string, name: string): Card => ({
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
});

const defaultProps = {
    mode: 'view' as const,
    setMode: jest.fn(),
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
        expect(screen.getByText(/Welcome to Your Pokémon Card Tracker/i)).toBeInTheDocument();
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
        } as any);

        render(<Home {...defaultProps} user={mockUser} />);

        await waitFor(() => {
            expect(screen.getByText(/Your collection is empty/i)).toBeInTheDocument();
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
        } as any);

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
            expect(screen.getByText(/Your collection is empty/i)).toBeInTheDocument();
        });
        expect(mockFrom).not.toHaveBeenCalled();
    });

    it('shows empty state when lists array is empty', async () => {
        render(<Home {...defaultProps} user={mockUser} lists={[]} />);

        await waitFor(() => {
            expect(screen.getByText(/Your collection is empty/i)).toBeInTheDocument();
        });
        expect(mockFrom).not.toHaveBeenCalled();
    });
});
