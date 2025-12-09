import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function UpdateCardForm({ initialData }: { initialData: any }) {
    const [name, setName] = useState(initialData.name);
    const [setNameVal, setSetNameVal] = useState(initialData.set_name || '');
    const [price, setPrice] = useState(initialData.price ? String(initialData.price) : '');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Note: The uploadImage function remains the same as in AddCardForm

    async function uploadImage(fileName: string, file: File) {
        const filePath = `${Date.now()}_${fileName}`;
        // Delete old image if it exists before uploading a new one, for cleanup
        if (initialData.image_path) {
            await supabase.storage.from('card-images').remove([initialData.image_path]);
        }
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
            let image_path = initialData.image_path;
            if (file) {
                // Only upload if a new file is selected
                image_path = await uploadImage(file.name, file);
            }

            const { error } = await supabase
                .from('cards')
                .update({
                    name,
                    set_name: setNameVal,
                    price: price ? Number(price) : null,
                    image_path,
                })
                .eq('id', initialData.id); // Crucial: identify the card to update

            if (error) throw error;
            alert('Card updated successfully!');
            router.push('/'); // Redirect back to the collection page
        } catch (err: any) {
            alert(err.message || JSON.stringify(err));
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8 }}>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Card name" required />
            <input value={setNameVal} onChange={e => setSetNameVal(e.target.value)} placeholder="Set name (optional)" />
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="Price (e.g. 12.50)" />
            {initialData.image_path && <p>Current image: {initialData.image_path}</p>}
            <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] ?? null)} />
            <button disabled={loading} type="submit">Save Changes</button>
        </form>
    );
}