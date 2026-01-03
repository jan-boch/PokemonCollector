import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';


export default function AddCardForm() {
    const [name, setName] = useState('');
    const [setNameVal, setSetNameVal] = useState('');
    const [price, setPrice] = useState('');
    const [cardmarketUrl, setCardmarketUrl] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);


    async function uploadImage(fileName: string, file: File) {
        const filePath = `${Date.now()}_${fileName}`;
        const { error } = await supabase.storage
            .from('card-images')
            .upload(filePath, file, { upsert: false });
        if (error) throw error;
        return filePath;
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            let image_path = null;
            if (file) {
                image_path = await uploadImage(file.name, file);
            }

            // Normalize the price input
            const normalizedPriceString = price.replace(',', '.');

            // Check if the resulting string is a valid number before converting
            const finalPrice = normalizedPriceString && !isNaN(Number(normalizedPriceString))
                ? Number(normalizedPriceString)
                : null; // Set to null if invalid or empty

            const { error } = await supabase.from('cards').insert([{
                name,
                set_name: setNameVal,
                price: finalPrice,
                cardmarket_url: cardmarketUrl || null,
                image_path,
            }]).select().single();
            if (error) throw error;
            alert('Card added');
            // optionally redirect or clear
            setName(''); setSetNameVal(''); setPrice(''); setFile(null);
        } catch (err: any) {
            alert(err.message || JSON.stringify(err));
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8 }}>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Card name" required maxLength={24} />
            <input value={setNameVal} onChange={e => setSetNameVal(e.target.value)} placeholder="Set name (optional)" maxLength={35} />
            <input value={price} onChange={e => setPrice(e.target.value)} placeholder="Price (e.g. 12,50 or 12.50)" />
            <input type="url" value={cardmarketUrl} onChange={e => setCardmarketUrl(e.target.value)} placeholder="Cardmarket URL (optional)"/>
            <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] ?? null)} />
            <button disabled={loading} type="submit">Add card</button>
        </form>
    );
}
