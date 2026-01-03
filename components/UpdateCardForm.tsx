import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';

interface List {
    id: string;
    name: string;
}

export default function UpdateCardForm({ initialData, user, lists }: { initialData: any, user: any, lists: List[] }) {
    const [name, setName] = useState(initialData.name);
    const [setNameVal, setSetNameVal] = useState(initialData.set_name || '');
    const [price, setPrice] = useState(initialData.price ? String(initialData.price) : '');
    const [cardmarketUrl, setCardmarketUrl] = useState(initialData.cardmarket_url || '');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const [selectedList, setSelectedList] = useState('');

    useEffect(() => {
        if (lists.length > 0 && initialData.list_id) {
            const currentList = lists.find(list => list.id === initialData.list_id);
            if (currentList) {
                setSelectedList(currentList.name);
            } else {
                // Fallback if the initial list_id doesn't match any fetched list (e.g., deleted list)
                setSelectedList(lists[0].name);
            }
        } else if (lists.length > 0) {
            setSelectedList(lists[0].name);
        }
    }, [lists, initialData.list_id]);

    async function uploadImage(fileName: string, file: File) {
        const filePath = `${user.id}/${Date.now()}_${fileName}`;
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
            const normalizedPriceString = price.replace(',', '.');

            const finalPrice = normalizedPriceString && !isNaN(Number(normalizedPriceString))
                ? Number(normalizedPriceString)
                : null;

            let image_path = initialData.image_path;
            if (file) {
                image_path = await uploadImage(file.name, file);
            }

            const targetList = lists.find(list => list.name === selectedList);
            if (!targetList) {
                throw new Error('Selected list not found.');
            }

            const { error } = await supabase
                .from('cards')
                .update({
                    name,
                    set_name: setNameVal,
                    price: finalPrice,
                    cardmarket_url: cardmarketUrl || null,
                    image_path,
                    list_id: targetList.id, // Update list_id
                })
                .eq('id', initialData.id);

            if (error) throw error;
            alert('Card updated successfully!');
            await router.push('/');
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
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="Price (e.g. 12,50 or 12.50)" />
            <input type="url" value={cardmarketUrl} onChange={e => setCardmarketUrl(e.target.value)} placeholder="Cardmarket URL (optional)"/>
            <select
                value={selectedList}
                onChange={e => setSelectedList(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
            >
                {lists.map(list => (
                    <option key={list.id} value={list.name}>{list.name}</option>
                ))}
            </select>
            {initialData.image_path && <p>Current image: {initialData.image_path}</p>}
            <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] ?? null)} />
            <button disabled={loading} type="submit">Save Changes</button>
        </form>
    );
}
