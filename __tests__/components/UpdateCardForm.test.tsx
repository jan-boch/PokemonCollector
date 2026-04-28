import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UpdateCardForm from '../../components/UpdateCardForm';
import type { User } from '@supabase/supabase-js';
import type { Card, List } from '../../lib/types';
import { supabase } from '../../lib/supabaseClient';

const mockRouterPush = jest.fn();
jest.mock('next/router', () => ({
    useRouter: () => ({ push: mockRouterPush }),
}));

jest.mock('../../lib/supabaseClient', () => ({
    supabase: {
        from: jest.fn(),
        storage: {
            from: jest.fn(),
        },
    },
}));

const mockFrom = jest.mocked(supabase.from);

const mockUser = { id: 'user-1', email: 'test@example.com' } as User;
const mockLists: List[] = [
    { id: 'list-1', name: 'Base' },
    { id: 'list-2', name: 'Jungle' },
];

const initialCard: Card = {
    id: 'card-1',
    name: 'Charizard',
    set_name: 'Base Set',
    price: 250,
    cardmarket_url: 'https://cardmarket.com/charizard',
    image_path: null,
    list_id: 'list-1',
    user_id: 'user-1',
    collected: false,
    created_at: '2024-01-01T00:00:00Z',
    position: 0,
};

describe('UpdateCardForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        window.alert = jest.fn();
    });

    // --- Pre-population ---

    it('pre-populates the name field with initialData.name', () => {
        render(<UpdateCardForm initialData={initialCard} user={mockUser} lists={mockLists} />);
        expect(screen.getByPlaceholderText('Card name')).toHaveValue('Charizard');
    });

    it('pre-populates the set name field with initialData.set_name', () => {
        render(<UpdateCardForm initialData={initialCard} user={mockUser} lists={mockLists} />);
        expect(screen.getByPlaceholderText('Set name')).toHaveValue('Base Set');
    });

    it('pre-populates the price field with initialData.price as string', () => {
        render(<UpdateCardForm initialData={initialCard} user={mockUser} lists={mockLists} />);
        expect(screen.getByPlaceholderText(/Price/)).toHaveValue('250');
    });

    it('pre-populates the cardmarket URL field', () => {
        render(<UpdateCardForm initialData={initialCard} user={mockUser} lists={mockLists} />);
        expect(screen.getByPlaceholderText('https://...')).toHaveValue('https://cardmarket.com/charizard');
    });

    it('pre-selects the list matching initialData.list_id', async () => {
        render(<UpdateCardForm initialData={initialCard} user={mockUser} lists={mockLists} />);
        // useEffect sets the list — wait for it
        await waitFor(() => {
            const select = screen.getByRole('combobox') as HTMLSelectElement;
            expect(select.value).toBe('Base');
        });
    });

    it('falls back to first list if list_id does not match any list', async () => {
        const cardWithUnknownList = { ...initialCard, list_id: 'unknown-list' };
        render(<UpdateCardForm initialData={cardWithUnknownList} user={mockUser} lists={mockLists} />);
        await waitFor(() => {
            const select = screen.getByRole('combobox') as HTMLSelectElement;
            expect(select.value).toBe('Base');
        });
    });

    it('shows the current image path when image_path is set', () => {
        const cardWithImage = { ...initialCard, image_path: 'user-1/123_charizard.jpg' };
        render(<UpdateCardForm initialData={cardWithImage} user={mockUser} lists={mockLists} />);
        expect(screen.getByText(/user-1\/123_charizard\.jpg/)).toBeInTheDocument();
    });

    it('does not show current image text when image_path is null', () => {
        render(<UpdateCardForm initialData={initialCard} user={mockUser} lists={mockLists} />);
        expect(screen.queryByText(/Current:/)).not.toBeInTheDocument();
    });

    // --- Submission ---

    it('calls supabase update with correct data on submit', async () => {
        const mockUpdate = jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null }),
        });
        mockFrom.mockReturnValue({ update: mockUpdate } as unknown as ReturnType<typeof supabase.from>);

        render(<UpdateCardForm initialData={initialCard} user={mockUser} lists={mockLists} />);

        fireEvent.change(screen.getByPlaceholderText('Card name'), { target: { value: 'Charizard V' } });
        fireEvent.submit(screen.getByRole('button', { name: 'Save Changes' }).closest('form')!);

        await waitFor(() => {
            expect(mockUpdate).toHaveBeenCalledWith(
                expect.objectContaining({ name: 'Charizard V' })
            );
        });
        await waitFor(() => {
            expect(mockRouterPush).toHaveBeenCalledWith('/');
        });
    });

    it('converts comma decimal separator to dot in price on submit', async () => {
        const cardWithCommaPrice = { ...initialCard, price: null };
        const mockUpdate = jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null }),
        });
        mockFrom.mockReturnValue({ update: mockUpdate } as unknown as ReturnType<typeof supabase.from>);

        render(<UpdateCardForm initialData={cardWithCommaPrice} user={mockUser} lists={mockLists} />);
        fireEvent.change(screen.getByPlaceholderText(/Price/), { target: { value: '12,50' } });
        fireEvent.submit(screen.getByRole('button', { name: 'Save Changes' }).closest('form')!);

        await waitFor(() => {
            expect(mockUpdate).toHaveBeenCalledWith(
                expect.objectContaining({ price: 12.5 })
            );
        });
    });

    it('sets price to null for empty price field', async () => {
        const mockUpdate = jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null }),
        });
        mockFrom.mockReturnValue({ update: mockUpdate } as unknown as ReturnType<typeof supabase.from>);

        render(<UpdateCardForm initialData={initialCard} user={mockUser} lists={mockLists} />);
        fireEvent.change(screen.getByPlaceholderText(/Price/), { target: { value: '' } });
        fireEvent.submit(screen.getByRole('button', { name: 'Save Changes' }).closest('form')!);

        await waitFor(() => {
            expect(mockUpdate).toHaveBeenCalledWith(
                expect.objectContaining({ price: null })
            );
        });
    });

    it('shows Save Changes button initially', () => {
        render(<UpdateCardForm initialData={initialCard} user={mockUser} lists={mockLists} />);
        expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
    });

    it('enforces maxLength of 32 on the card name input', () => {
        render(<UpdateCardForm initialData={initialCard} user={mockUser} lists={mockLists} />);
        expect(screen.getByPlaceholderText('Card name')).toHaveAttribute('maxLength', '32');
    });
});
