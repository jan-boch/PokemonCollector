import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddCardForm from '../../components/AddCardForm';
import type { User } from '@supabase/supabase-js';
import type { List } from '../../lib/types';
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

// Shared insert spy — referenced directly in assertions
const mockInsert = jest.fn();

const mockUser = { id: 'user-1', email: 'test@example.com' } as User;
const mockLists: List[] = [
    { id: 'list-1', name: 'Base' },
    { id: 'list-2', name: 'Jungle' },
];

/** Sets up supabase.from to handle the two sequential calls in onSubmit:
 *  1. .from('cards').select('position').eq().order().limit() → get max position
 *  2. .from('cards').insert([]).select() → insert card
 */
function setupInsertMock(
    insertResult: { data: unknown; error: unknown } = { data: [{ id: 'new-card' }], error: null },
    maxPositionResult: { data: unknown; error: unknown } = { data: [], error: null }
) {
    mockInsert.mockReturnValue({
        select: jest.fn().mockResolvedValue(insertResult),
    });
    mockFrom.mockImplementation(() => ({
        // Used by "get max position" query
        select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
                order: jest.fn().mockReturnValue({
                    limit: jest.fn().mockResolvedValue(maxPositionResult),
                }),
            }),
        }),
        // Used by the insert query — shared spy so we can inspect calls
        insert: mockInsert,
    } as unknown as ReturnType<typeof supabase.from>));
}

describe('AddCardForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        window.alert = jest.fn();
        mockInsert.mockReset();
    });

    // --- Rendering ---

    it('renders the card name input', () => {
        render(<AddCardForm user={mockUser} lists={mockLists} activeList="Base" />);
        expect(screen.getByPlaceholderText('Card name')).toBeInTheDocument();
    });

    it('renders the set name input', () => {
        render(<AddCardForm user={mockUser} lists={mockLists} activeList="Base" />);
        expect(screen.getByPlaceholderText('Set name (optional)')).toBeInTheDocument();
    });

    it('renders the price input', () => {
        render(<AddCardForm user={mockUser} lists={mockLists} activeList="Base" />);
        expect(screen.getByPlaceholderText(/Price/)).toBeInTheDocument();
    });

    it('renders a list selector with all list names', () => {
        render(<AddCardForm user={mockUser} lists={mockLists} activeList="Base" />);
        expect(screen.getByRole('option', { name: 'Base' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Jungle' })).toBeInTheDocument();
    });

    it('defaults the selected list to activeList prop', () => {
        render(<AddCardForm user={mockUser} lists={mockLists} activeList="Jungle" />);
        const select = screen.getByRole('combobox') as HTMLSelectElement;
        expect(select.value).toBe('Jungle');
    });

    it('renders the file input for images', () => {
        render(<AddCardForm user={mockUser} lists={mockLists} activeList="Base" />);
        // AddCardForm has no label for the file input — query by type
        expect(document.querySelector('input[type="file"]')).toBeInTheDocument();
    });

    it('renders the submit button', () => {
        render(<AddCardForm user={mockUser} lists={mockLists} activeList="Base" />);
        expect(screen.getByRole('button', { name: 'Add card' })).toBeInTheDocument();
    });

    it('enforces maxLength of 32 on the card name input', () => {
        render(<AddCardForm user={mockUser} lists={mockLists} activeList="Base" />);
        expect(screen.getByPlaceholderText('Card name')).toHaveAttribute('maxLength', '32');
    });

    // --- Submission ---

    it('inserts a card with correct data on submit', async () => {
        setupInsertMock();
        render(<AddCardForm user={mockUser} lists={mockLists} activeList="Base" />);

        fireEvent.change(screen.getByPlaceholderText('Card name'), { target: { value: 'Charizard' } });
        fireEvent.change(screen.getByPlaceholderText('Set name (optional)'), { target: { value: 'Base Set' } });
        fireEvent.change(screen.getByPlaceholderText(/Price/), { target: { value: '250' } });
        fireEvent.submit(screen.getByRole('button', { name: 'Add card' }).closest('form')!);

        await waitFor(() => {
            expect(mockRouterPush).toHaveBeenCalledWith('/');
        });

        const insertCall = mockInsert.mock.calls[0][0][0];
        expect(insertCall.name).toBe('Charizard');
        expect(insertCall.set_name).toBe('Base Set');
        expect(insertCall.price).toBe(250);
        expect(insertCall.list_id).toBe('list-1');
        expect(insertCall.user_id).toBe('user-1');
    });

    it('converts comma decimal separator to dot before inserting price', async () => {
        setupInsertMock();
        render(<AddCardForm user={mockUser} lists={mockLists} activeList="Base" />);

        fireEvent.change(screen.getByPlaceholderText('Card name'), { target: { value: 'Mew' } });
        fireEvent.change(screen.getByPlaceholderText(/Price/), { target: { value: '12,50' } });
        fireEvent.submit(screen.getByRole('button', { name: 'Add card' }).closest('form')!);

        await waitFor(() => {
            expect(mockRouterPush).toHaveBeenCalledWith('/');
        });

        const insertCall = mockInsert.mock.calls[0][0][0];
        expect(insertCall.price).toBe(12.5);
    });

    it('sets price to null when price field is empty', async () => {
        setupInsertMock();
        render(<AddCardForm user={mockUser} lists={mockLists} activeList="Base" />);

        fireEvent.change(screen.getByPlaceholderText('Card name'), { target: { value: 'Mewtwo' } });
        // price field left empty
        fireEvent.submit(screen.getByRole('button', { name: 'Add card' }).closest('form')!);

        await waitFor(() => {
            expect(mockRouterPush).toHaveBeenCalledWith('/');
        });

        const insertCall = mockInsert.mock.calls[0][0][0];
        expect(insertCall.price).toBeNull();
    });

    it('sets price to null for non-numeric input', async () => {
        setupInsertMock();
        render(<AddCardForm user={mockUser} lists={mockLists} activeList="Base" />);

        fireEvent.change(screen.getByPlaceholderText('Card name'), { target: { value: 'Bulbasaur' } });
        fireEvent.change(screen.getByPlaceholderText(/Price/), { target: { value: 'abc' } });
        fireEvent.submit(screen.getByRole('button', { name: 'Add card' }).closest('form')!);

        await waitFor(() => {
            expect(mockRouterPush).toHaveBeenCalledWith('/');
        });

        const insertCall = mockInsert.mock.calls[0][0][0];
        expect(insertCall.price).toBeNull();
    });

    it('assigns position = 0 when the list is empty', async () => {
        setupInsertMock();
        render(<AddCardForm user={mockUser} lists={mockLists} activeList="Base" />);

        fireEvent.change(screen.getByPlaceholderText('Card name'), { target: { value: 'Squirtle' } });
        fireEvent.submit(screen.getByRole('button', { name: 'Add card' }).closest('form')!);

        await waitFor(() => {
            expect(mockRouterPush).toHaveBeenCalledWith('/');
        });

        const insertCall = mockInsert.mock.calls[0][0][0];
        expect(insertCall.position).toBe(0);
    });

    it('assigns nextPosition = maxPosition + 1 when cards already exist', async () => {
        // max position = 3, so next = 4
        setupInsertMock(
            { data: [{ id: 'new-card' }], error: null },
            { data: [{ position: 3 }], error: null }
        );

        render(<AddCardForm user={mockUser} lists={mockLists} activeList="Base" />);

        fireEvent.change(screen.getByPlaceholderText('Card name'), { target: { value: 'Gengar' } });
        fireEvent.submit(screen.getByRole('button', { name: 'Add card' }).closest('form')!);

        await waitFor(() => {
            expect(mockRouterPush).toHaveBeenCalledWith('/');
        });

        const insertCall = mockInsert.mock.calls[0][0][0];
        expect(insertCall.position).toBe(4);
    });

    it('shows alert and does not redirect on supabase error', async () => {
        mockFrom.mockImplementation(() => ({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    order: jest.fn().mockReturnValue({
                        limit: jest.fn().mockResolvedValue({ data: [], error: null }),
                    }),
                }),
            }),
            insert: jest.fn().mockReturnValue({
                select: jest.fn().mockResolvedValue({ data: null, error: { message: 'Insert error' } }),
            }),
        } as unknown as ReturnType<typeof supabase.from>));

        render(<AddCardForm user={mockUser} lists={mockLists} activeList="Base" />);
        fireEvent.change(screen.getByPlaceholderText('Card name'), { target: { value: 'Jigglypuff' } });
        fireEvent.submit(screen.getByRole('button', { name: 'Add card' }).closest('form')!);

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Insert error'));
        });
        expect(mockRouterPush).not.toHaveBeenCalled();
    });
});
