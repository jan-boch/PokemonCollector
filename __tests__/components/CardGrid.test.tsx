import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import CardGrid from '../../components/CardGrid';
import type { Card } from '../../lib/types';
import { supabase } from '../../lib/supabaseClient';
import type { DragEndEvent } from '@dnd-kit/core';

// Capture onDragEnd so tests can trigger it directly
let capturedOnDragEnd: ((event: DragEndEvent) => void) | undefined;

jest.mock('@dnd-kit/core', () => ({
    DndContext: ({ children, onDragEnd }: { children: React.ReactNode; onDragEnd: (e: DragEndEvent) => void }) => {
        capturedOnDragEnd = onDragEnd;
        return <>{children}</>;
    },
    closestCenter: jest.fn(),
    PointerSensor: jest.fn(),
    useSensor: jest.fn(),
    useSensors: jest.fn(() => []),
}));

jest.mock('@dnd-kit/sortable', () => ({
    SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useSortable: jest.fn(() => ({
        attributes: {},
        listeners: {},
        setNodeRef: jest.fn(),
        transform: null,
        transition: null,
        isDragging: false,
    })),
    rectSortingStrategy: jest.fn(),
    arrayMove: jest.fn((arr: unknown[], from: number, to: number) => {
        const result = [...arr];
        const [removed] = result.splice(from, 1);
        result.splice(to, 0, removed);
        return result;
    }),
}));

jest.mock('@dnd-kit/utilities', () => ({
    CSS: { Transform: { toString: jest.fn(() => '') } },
}));

jest.mock('../../lib/supabaseClient', () => ({
    supabase: {
        from: jest.fn(),
    },
}));

jest.mock('next/router', () => ({
    useRouter: () => ({ push: jest.fn() }),
}));

const mockFrom = jest.mocked(supabase.from);

const makeCard = (id: string, name: string, position: number): Card => ({
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
    position,
});

const cards = [
    makeCard('card-1', 'Pikachu', 0),
    makeCard('card-2', 'Charizard', 1),
    makeCard('card-3', 'Mewtwo', 2),
];

describe('CardGrid', () => {
    const setCards = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        capturedOnDragEnd = undefined;
    });

    it('renders all provided cards', () => {
        render(<CardGrid initialCards={cards} mode="view" setCards={setCards} />);
        expect(screen.getByText('Pikachu')).toBeInTheDocument();
        expect(screen.getByText('Charizard')).toBeInTheDocument();
        expect(screen.getByText('Mewtwo')).toBeInTheDocument();
    });

    it('renders empty grid without crashing when no cards are provided', () => {
        render(<CardGrid initialCards={[]} mode="view" setCards={setCards} />);
        expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    it('updates cards state and calls supabase when drag ends on a different card', async () => {
        const mockEq = jest.fn().mockResolvedValue({ error: null });
        const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
        mockFrom.mockReturnValue({ update: mockUpdate } as unknown as ReturnType<typeof supabase.from>);

        render(<CardGrid initialCards={cards} mode="view" setCards={setCards} />);

        act(() => {
            capturedOnDragEnd!({
                active: { id: 'card-1' },
                over: { id: 'card-3' },
            } as DragEndEvent);
        });

        await waitFor(() => {
            expect(mockUpdate).toHaveBeenCalledTimes(3);
        });

        // After move: [Charizard, Mewtwo, Pikachu]
        expect(mockEq).toHaveBeenCalledWith('id', 'card-2');
        expect(mockEq).toHaveBeenCalledWith('id', 'card-3');
        expect(mockEq).toHaveBeenCalledWith('id', 'card-1');
    });

    it('does nothing when drag ends on the same card', async () => {
        render(<CardGrid initialCards={cards} mode="view" setCards={setCards} />);

        act(() => {
            capturedOnDragEnd!({
                active: { id: 'card-1' },
                over: { id: 'card-1' },
            } as DragEndEvent);
        });

        await waitFor(() => {
            expect(mockFrom).not.toHaveBeenCalled();
        });
    });

    it('does nothing when there is no over target', async () => {
        render(<CardGrid initialCards={cards} mode="view" setCards={setCards} />);

        act(() => {
            capturedOnDragEnd!({
                active: { id: 'card-1' },
                over: null,
            } as DragEndEvent);
        });

        await waitFor(() => {
            expect(mockFrom).not.toHaveBeenCalled();
        });
    });

    it('shows inline confirm then deletes card when confirmed', async () => {
        const mockEq = jest.fn().mockResolvedValue({ error: null });
        const mockDelete = jest.fn().mockReturnValue({ eq: mockEq });
        mockFrom.mockReturnValue({ delete: mockDelete } as unknown as ReturnType<typeof supabase.from>);

        render(<CardGrid initialCards={cards} mode="delete" setCards={setCards} />);

        // First click shows inline confirm
        fireEvent.click(screen.getByTitle('Delete Pikachu'));
        const confirmButton = await screen.findByRole('button', { name: 'Delete' });
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(mockDelete).toHaveBeenCalled();
            expect(mockEq).toHaveBeenCalledWith('id', 'card-1');
            expect(setCards).toHaveBeenCalled();
        });
    });

    it('does not delete when the user cancels the inline confirm', async () => {
        render(<CardGrid initialCards={cards} mode="delete" setCards={setCards} />);

        fireEvent.click(screen.getByTitle('Delete Pikachu'));
        const cancelButton = await screen.findByRole('button', { name: 'Cancel' });
        fireEvent.click(cancelButton);

        await waitFor(() => {
            expect(mockFrom).not.toHaveBeenCalled();
        });
    });
});
