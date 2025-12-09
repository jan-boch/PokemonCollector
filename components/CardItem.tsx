import { supabase } from '../lib/supabaseClient';
import Link from 'next/link'; // Import Link for edit mode

interface CardItemProps {
    card: any;
    onUpdate: (c:any) => void;
    mode: 'view' | 'delete' | 'edit'; // New prop
    onDelete: (id: string) => void; // New prop
}

export default function CardItem({ card, onUpdate, mode, onDelete }: CardItemProps) {
    const imageUrl = card.image_path ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/card-images/${card.image_path}` : null;

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
                        background: 'yellow',
                        border: '1px solid #333',
                        borderRadius: '50%',
                        width: 20,
                        height: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        padding: 0,
                        zIndex: 10
                    }}
                    title={`Edit ${card.name}`}
                >
                    ✏️
                </Link>
            )}

            <div style={{ minHeight: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {imageUrl ? <img src={imageUrl} alt={card.name} style={{ maxHeight: 140, width: 'auto' }} /> : <div>No image</div>}
            </div>
            <h3>{card.name}</h3>
            <div>{card.set_name}</div>
            <div>Price: {card.price ? `${card.price} €` : '-'}</div>
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