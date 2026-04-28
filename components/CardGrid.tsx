import React, { useState, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    useSortable,
    rectSortingStrategy,
    arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import CardItem from './CardItem';
import { supabase } from '../lib/supabaseClient';
import type { Card } from '../lib/types';

interface CardGridProps {
    initialCards: Card[];
    mode: 'view' | 'delete' | 'edit';
    setCards: React.Dispatch<React.SetStateAction<Card[]>>;
}

function SortableCard({ card, mode, onUpdate, onDelete }: {
    card: Card;
    mode: 'view' | 'delete' | 'edit';
    onUpdate: (c: Card) => void;
    onDelete: (id: string) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: card.id,
        disabled: mode !== 'view',
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className={mode === 'view' ? 'cursor-grab active:cursor-grabbing' : ''} {...attributes} {...listeners}>
            <CardItem
                card={card}
                onUpdate={onUpdate}
                mode={mode}
                onDelete={onDelete}
            />
        </div>
    );
}

export default function CardGrid({ initialCards, mode, setCards }: CardGridProps) {
    const [cards, setCardsState] = useState(initialCards);

    useEffect(() => {
        setCardsState(initialCards);
    }, [initialCards]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        })
    );

    function updateCard(updated: Card) {
        const newCards = cards.map(c => c.id === updated.id ? updated : c);
        setCardsState(newCards);
        setCards(newCards);
    }

    async function deleteCard(cardId: string) {
        const { error } = await supabase.from('cards').delete().eq('id', cardId);
        if (error) {
            console.error(error);
            return;
        }
        const newCards = cards.filter(c => c.id !== cardId);
        setCardsState(newCards);
        setCards(newCards);
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = cards.findIndex(c => c.id === active.id);
        const newIndex = cards.findIndex(c => c.id === over.id);
        const newCards = arrayMove(cards, oldIndex, newIndex);

        setCardsState(newCards);
        setCards(newCards);

        await Promise.all(
            newCards.map((card, index) =>
                supabase.from('cards').update({ position: index }).eq('id', card.id)
            )
        );
    }

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={cards.map(c => c.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {cards.map(card => (
                        <SortableCard
                            key={card.id}
                            card={card}
                            mode={mode}
                            onUpdate={updateCard}
                            onDelete={deleteCard}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}
