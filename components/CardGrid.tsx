import React, { useState, useEffect } from 'react';
import CardItem from './CardItem';
import { supabase } from '../lib/supabaseClient'; // Import for deletion

interface CardGridProps {
    initialCards: any[];
    mode: 'view' | 'delete' | 'edit';
    setMode: (mode: 'view' | 'delete' | 'edit') => void;
    setCards: React.Dispatch<React.SetStateAction<any[]>>; // To update list in index.tsx
}

export default function CardGrid({ initialCards, mode, setMode, setCards }: CardGridProps) {
    // 1. Initialize local state using the prop
    const [cards, setCardsState] = useState(initialCards);

    // 2. Use useEffect to synchronize local state with the initialCards prop
    // This runs only when initialCards changes (e.g., when data is re-fetched)
    useEffect(() => {
        setCardsState(initialCards);
    }, [initialCards]); // <-- Dependency array is used with useEffect

    // Handler for updating a single card (used for 'collected' checkbox)
    function updateCard(updated: any) {
        const newCards = cards.map(c => c.id === updated.id ? updated : c);
        setCardsState(newCards);
        setCards(newCards); // Update parent state in index.tsx
    }

    // Handler for deleting a card
    async function deleteCard(cardId: string) {
        if (!window.confirm("Are you sure you want to delete this card?")) return;

        const { error } = await supabase.from('cards').delete().eq('id', cardId);

        if (error) {
            console.error(error);
            alert('Error deleting card: ' + error.message);
            return;
        }

        // Remove from local state
        const newCards = cards.filter(c => c.id !== cardId);
        setCardsState(newCards);
        setCards(newCards); // Update parent state in index.tsx
        alert('Card deleted successfully!');
        setMode('view'); // Exit delete mode
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
            {cards.map(card => (
                <CardItem
                    key={card.id}
                    card={card}
                    onUpdate={updateCard}
                    mode={mode} // Pass mode down
                    onDelete={deleteCard} // Pass delete handler
                />
            ))}
        </div>
    );
}
