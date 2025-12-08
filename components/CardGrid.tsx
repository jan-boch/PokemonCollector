import { useState } from 'react';
import CardItem from './CardItem';

export default function CardGrid({ initialCards }: { initialCards: any[] }) {
    const [cards, setCards] = useState(initialCards);

    function updateCard(updated: any) {
        setCards((prev) => prev.map(c => c.id === updated.id ? updated : c));
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16 }}>
            {cards.map(card => (
                <CardItem key={card.id} card={card} onUpdate={updateCard} />
            ))}
        </div>
    );
}
