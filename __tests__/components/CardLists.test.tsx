import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CardLists from '../../components/CardLists';
import type { List } from '../../lib/types';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabaseClient';

jest.mock('../../lib/supabaseClient', () => ({
    supabase: {
        from: jest.fn(),
    },
}));

const mockFrom = jest.mocked(supabase.from);

const mockUser = { id: 'user-1', email: 'test@example.com' } as User;
const mockLists: List[] = [
    { id: 'list-1', name: 'Base' },
    { id: 'list-2', name: 'Jungle' },
];

describe('CardLists', () => {
    const setLists = jest.fn();
    const setActiveList = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        window.alert = jest.fn();
        window.prompt = jest.fn();
    });

    it('renders each list as a tab button', () => {
        render(
            <CardLists
                user={mockUser}
                lists={mockLists}
                setLists={setLists}
                activeList="Base"
                setActiveList={setActiveList}
            />
        );
        expect(screen.getByText('Base')).toBeInTheDocument();
        expect(screen.getByText('Jungle')).toBeInTheDocument();
    });

    it('calls setActiveList with the list name when a tab is clicked', () => {
        render(
            <CardLists
                user={mockUser}
                lists={mockLists}
                setLists={setLists}
                activeList="Base"
                setActiveList={setActiveList}
            />
        );
        fireEvent.click(screen.getByText('Jungle'));
        expect(setActiveList).toHaveBeenCalledWith('Jungle');
    });

    it('renders the + button for adding a new list', () => {
        render(
            <CardLists
                user={mockUser}
                lists={mockLists}
                setLists={setLists}
                activeList="Base"
                setActiveList={setActiveList}
            />
        );
        expect(screen.getByTitle('Add new list')).toBeInTheDocument();
    });

    it('does nothing when prompt is cancelled (returns null)', () => {
        (window.prompt as jest.Mock).mockReturnValue(null);
        render(
            <CardLists
                user={mockUser}
                lists={mockLists}
                setLists={setLists}
                activeList="Base"
                setActiveList={setActiveList}
            />
        );
        fireEvent.click(screen.getByTitle('Add new list'));
        expect(mockFrom).not.toHaveBeenCalled();
        expect(setLists).not.toHaveBeenCalled();
    });

    it('does nothing when prompt returns empty string', () => {
        (window.prompt as jest.Mock).mockReturnValue('');
        render(
            <CardLists
                user={mockUser}
                lists={mockLists}
                setLists={setLists}
                activeList="Base"
                setActiveList={setActiveList}
            />
        );
        fireEvent.click(screen.getByTitle('Add new list'));
        expect(mockFrom).not.toHaveBeenCalled();
    });

    it('shows inline error and does not call supabase for a duplicate list name', async () => {
        render(
            <CardLists
                user={mockUser}
                lists={mockLists}
                setLists={setLists}
                activeList="Base"
                setActiveList={setActiveList}
            />
        );
        fireEvent.click(screen.getByTitle('Add new list'));
        const input = screen.getByPlaceholderText('List name');
        fireEvent.change(input, { target: { value: 'Base' } });
        fireEvent.submit(input.closest('form')!);
        expect(await screen.findByText('A list with this name already exists.')).toBeInTheDocument();
        expect(mockFrom).not.toHaveBeenCalled();
    });

    it('inserts new list in supabase and updates state on success', async () => {
        const newList = { id: 'list-3', name: 'Fossil' };
        mockFrom.mockReturnValue({
            insert: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({ data: newList, error: null }),
                }),
            }),
        } as unknown as ReturnType<typeof supabase.from>);

        render(
            <CardLists
                user={mockUser}
                lists={mockLists}
                setLists={setLists}
                activeList="Base"
                setActiveList={setActiveList}
            />
        );
        fireEvent.click(screen.getByTitle('Add new list'));
        const input = screen.getByPlaceholderText('List name');
        fireEvent.change(input, { target: { value: 'Fossil' } });
        fireEvent.submit(input.closest('form')!);

        await waitFor(() => expect(mockFrom).toHaveBeenCalledWith('lists'));
        await waitFor(() => expect(setActiveList).toHaveBeenCalledWith('Fossil'));
        await waitFor(() => expect(setLists).toHaveBeenCalled());
    });

    it('shows inline error when supabase returns an error on insert', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        mockFrom.mockReturnValue({
            insert: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Insert failed' } }),
                }),
            }),
        } as unknown as ReturnType<typeof supabase.from>);

        render(
            <CardLists
                user={mockUser}
                lists={mockLists}
                setLists={setLists}
                activeList="Base"
                setActiveList={setActiveList}
            />
        );
        fireEvent.click(screen.getByTitle('Add new list'));
        const input = screen.getByPlaceholderText('List name');
        fireEvent.change(input, { target: { value: 'ErrorList' } });
        fireEvent.submit(input.closest('form')!);

        await waitFor(() => {
            expect(screen.getByText('Insert failed')).toBeInTheDocument();
        });
        expect(setLists).not.toHaveBeenCalled();
        consoleErrorSpy.mockRestore();
    });
});
