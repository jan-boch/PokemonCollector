import { supabase } from '../lib/supabaseClient';

export default function CardItem({ card, onUpdate }: { card: any, onUpdate: (c:any)=>void }) {
    const imageUrl = card.image_path ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/card-images/${card.image_path}` : null;


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
    <div style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
        <div style={{ minHeight: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {imageUrl ? <img src={imageUrl} alt={card.name} style={{ maxHeight: 140, width: 'auto' }} /> : <div>No image</div>}
        </div>
        <h3>{card.name}</h3>
        <div>{card.set_name}</div>
        <div>Price: {card.price ? `${card.price} €` : '-'}</div>
        <label style={{ display: 'block', marginTop: 8 }}>
            <input type="checkbox" checked={card.collected} onChange={toggleCollected} /> Collected
        </label>
    </div>
    );
}
