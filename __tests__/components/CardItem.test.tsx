import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CardItem from '../../components/CardItem';
import type { Card } from '../../lib/types';
import { supabase } from '../../lib/supabaseClient';

jest.mock('../../lib/supabaseClient', () => ({
    supabase: {
        from: jest.fn(),
    },
}));

jest.mock('next/router', () => ({
    useRouter: () => ({ push: jest.fn() }),
}));

const mockFrom = jest.mocked(supabase.from);

const baseCard: Card = {
    id: 'card-1',
    name: 'Pikachu',
    set_name: 'Base Set',
    price: 12.5,
    cardmarket_url: null,
    image_path: null,
    list_id: 'list-1',
    user_id: 'user-1',
    collected: false,
    created_at: '2024-01-01T00:00:00Z',
    position: 0,
};

describe('CardItem', () => {
    const onUpdate = jest.fn();
    const onDelete = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        window.alert = jest.fn();
    });

    // --- Rendering ---

    it('renders the card name', () => {
        render(<CardItem card={baseCard} onUpdate={onUpdate} mode="view" onDelete={onDelete} />);
        expect(screen.getByText('Pikachu')).toBeInTheDocument();
    });

    it('renders the set name', () => {
        render(<CardItem card={baseCard} onUpdate={onUpdate} mode="view" onDelete={onDelete} />);
        expect(screen.getByText('Base Set')).toBeInTheDocument();
    });

    it('formats price with EUR and comma decimal separator', () => {
        render(<CardItem card={baseCard} onUpdate={onUpdate} mode="view" onDelete={onDelete} />);
        // de-DE locale formats 12.5 as "12,50 €"
        const priceEl = screen.getByText(/Price:/);
        expect(priceEl.textContent).toMatch(/12,50/);
    });

    it('shows "-" for null price', () => {
        render(<CardItem card={{ ...baseCard, price: null }} onUpdate={onUpdate} mode="view" onDelete={onDelete} />);
        expect(screen.getByText('Price: -')).toBeInTheDocument();
    });

    it('shows "No image" when image_path is null', () => {
        render(<CardItem card={baseCard} onUpdate={onUpdate} mode="view" onDelete={onDelete} />);
        expect(screen.getByText('No image')).toBeInTheDocument();
    });

    it('wraps image with cardmarket link when cardmarket_url is set', () => {
        render(
            <CardItem
                card={{ ...baseCard, cardmarket_url: 'https://cardmarket.com/pikachu' }}
                onUpdate={onUpdate}
                mode="view"
                onDelete={onDelete}
            />
        );
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', 'https://cardmarket.com/pikachu');
    });

    it('does not render a link when cardmarket_url is null', () => {
        render(<CardItem card={baseCard} onUpdate={onUpdate} mode="view" onDelete={onDelete} />);
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    // --- Mode: view ---

    it('does not show delete button in view mode', () => {
        render(<CardItem card={baseCard} onUpdate={onUpdate} mode="view" onDelete={onDelete} />);
        expect(screen.queryByTitle('Delete Pikachu')).not.toBeInTheDocument();
    });

    it('does not show edit link in view mode', () => {
        render(<CardItem card={baseCard} onUpdate={onUpdate} mode="view" onDelete={onDelete} />);
        expect(screen.queryByTitle('Edit Pikachu')).not.toBeInTheDocument();
    });

    it('checkbox is enabled in view mode', () => {
        render(<CardItem card={baseCard} onUpdate={onUpdate} mode="view" onDelete={onDelete} />);
        expect(screen.getByRole('checkbox')).not.toBeDisabled();
    });

    // --- Mode: delete ---

    it('shows delete button in delete mode', () => {
        render(<CardItem card={baseCard} onUpdate={onUpdate} mode="delete" onDelete={onDelete} />);
        expect(screen.getByTitle('Delete Pikachu')).toBeInTheDocument();
    });

    it('calls onDelete with card.id when delete button is clicked', () => {
        render(<CardItem card={baseCard} onUpdate={onUpdate} mode="delete" onDelete={onDelete} />);
        fireEvent.click(screen.getByTitle('Delete Pikachu'));
        expect(onDelete).toHaveBeenCalledWith('card-1');
    });

    it('checkbox is disabled in delete mode', () => {
        render(<CardItem card={baseCard} onUpdate={onUpdate} mode="delete" onDelete={onDelete} />);
        expect(screen.getByRole('checkbox')).toBeDisabled();
    });

    // --- Mode: edit ---

    it('shows edit link in edit mode', () => {
        render(<CardItem card={baseCard} onUpdate={onUpdate} mode="edit" onDelete={onDelete} />);
        expect(screen.getByTitle('Edit Pikachu')).toBeInTheDocument();
    });

    it('edit link navigates to /update/[id]', () => {
        render(<CardItem card={baseCard} onUpdate={onUpdate} mode="edit" onDelete={onDelete} />);
        expect(screen.getByTitle('Edit Pikachu')).toHaveAttribute('href', '/update/card-1');
    });

    it('does not show delete button in edit mode', () => {
        render(<CardItem card={baseCard} onUpdate={onUpdate} mode="edit" onDelete={onDelete} />);
        expect(screen.queryByTitle('Delete Pikachu')).not.toBeInTheDocument();
    });

    // --- Collected checkbox ---

    it('renders unchecked checkbox when card.collected is false', () => {
        render(<CardItem card={baseCard} onUpdate={onUpdate} mode="view" onDelete={onDelete} />);
        expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('renders checked checkbox when card.collected is true', () => {
        render(<CardItem card={{ ...baseCard, collected: true }} onUpdate={onUpdate} mode="view" onDelete={onDelete} />);
        expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('calls supabase update and onUpdate when checkbox is toggled', async () => {
        const updatedCard = { ...baseCard, collected: true };
        mockFrom.mockReturnValue({
            update: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    select: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({ data: updatedCard, error: null }),
                    }),
                }),
            }),
        } as unknown as ReturnType<typeof supabase.from>);

        render(<CardItem card={baseCard} onUpdate={onUpdate} mode="view" onDelete={onDelete} />);
        fireEvent.click(screen.getByRole('checkbox'));

        await waitFor(() => {
            expect(onUpdate).toHaveBeenCalledWith(updatedCard);
        });
    });

    it('shows alert and does not call onUpdate when supabase returns an error', async () => {
        mockFrom.mockReturnValue({
            update: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    select: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
                    }),
                }),
            }),
        } as unknown as ReturnType<typeof supabase.from>);

        render(<CardItem card={baseCard} onUpdate={onUpdate} mode="view" onDelete={onDelete} />);
        fireEvent.click(screen.getByRole('checkbox'));

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('DB error');
        });
        expect(onUpdate).not.toHaveBeenCalled();
    });
});
