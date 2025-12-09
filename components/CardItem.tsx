import { supabase } from '../lib/supabaseClient';
import Link from 'next/link'; // Import Link for edit mode

interface CardItemProps {
    card: any;
    onUpdate: (c:any) => void;
    mode: 'view' | 'delete' | 'edit'; // New prop
    onDelete: (id: string) => void; // New prop
}

// Function to format the price
function formatPrice(price: number | null): string {
    if (price === null || price === undefined) {
        return '-';
    }

    // Use Intl.NumberFormat for currency formatting
    // 'de-DE' locale is a common European locale that uses comma (,) for decimals
    // 'EUR' is the currency code
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        // This ensures two decimal places (e.g., 7,00 €)
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(price);
}

export default function CardItem({ card, onUpdate, mode, onDelete }: CardItemProps) {
    const imageUrl = card.image_path ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/card-images/${card.image_path}` : null;
    const { cardmarket_url } = card;

    // ... (toggleCollected function remains the same)
    async function toggleCollected() {
        const { data, error } = await supabase
            .from('cards')
            .update({ collected: !card.collected })
            .eq('id', card.id)
            .select()
            .single();
        if (error) return alert(error.message);
        onUpdate(data);
    }

    // Image element definition
    const ImageElement = imageUrl ? (
        <img src={imageUrl} alt={card.name} style=
            {{
                maxWidth: '100%',
                maxHeight: 230,
                height: 'auto',
                width: 'auto',
                objectFit: 'contain'
            }}
        />
    ) : (
        <div>No image</div>
    );

    return (
        <div style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8, position: 'relative' }}>

            {/* --- DELETE Button --- */}
            {mode === 'delete' && (
                <button
                    onClick={() => onDelete(card.id)}
                    style={{
                        position: 'absolute',
                        top: 5,
                        right: 5,
                        background: 'red',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: 20,
                        height: 20,
                        lineHeight: '18px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        padding: 0,
                        zIndex: 10
                    }}
                    title={`Delete ${card.name}`}
                >
                    &times;
                </button>
            )}

            {/* --- EDIT Button (Link) --- */}
            {mode === 'edit' && (
                // Use a Link to navigate to a new update page, passing the card ID
                <Link
                    href={`/update/${card.id}`}
                    style={{
                        position: 'absolute',
                        top: 5,
                        right: 5,
                        width: 20,
                        height: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        padding: 0,
                        zIndex: 10,
                        color: 'inherit',
                        textDecoration: 'none'
                    }}
                    title={`Edit ${card.name}`}
                >
                    ✏️
                </Link>
            )}

            <div style={{ minHeight: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {cardmarket_url ? (
                    <a href={cardmarket_url} target="_blank" rel="noopener noreferrer" style={{ cursor: 'pointer' }}>
                        {ImageElement}
                    </a>
                ) : (
                    ImageElement
                )}
            </div>
            <h3>{card.name}</h3>
            <div>{card.set_name}</div>
            <div>Price: {formatPrice(card.price)}</div>
            <label style={{ display: 'block', marginTop: 8 }}>
                {/* Collected checkbox should only be editable in 'view' or 'edit' mode */}
                <input
                    type="checkbox"
                    checked={card.collected}
                    onChange={toggleCollected}
                    disabled={mode === 'delete'} // Disable checkbox in delete mode
                /> Collected
            </label>
        </div>
    );
}