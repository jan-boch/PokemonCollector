import React, { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';
import type { List } from '../lib/types';

export default function AddCardForm({ user, lists, activeList }: { user: User, lists: List[], activeList: string }) {
    const [name, setName] = useState('');
    const [setNameVal, setSetNameVal] = useState('');
    const [price, setPrice] = useState('');
    const [cardmarketUrl, setCardmarketUrl] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedList, setSelectedList] = useState(activeList);
    const router = useRouter();

    async function uploadImage(fileName: string, file: File) {
        const filePath = `${user.id}/${Date.now()}_${fileName}`;
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

            const normalizedPriceString = price.replace(',', '.');
            const finalPrice = normalizedPriceString && !isNaN(Number(normalizedPriceString))
                ? Number(normalizedPriceString)
                : null;

            const targetList = lists.find(l => l.name === selectedList);
            if (!targetList) {
                throw new Error('Could not find the selected list.');
            }

            const { data: maxData } = await supabase
                .from('cards')
                .select('position')
                .eq('list_id', targetList.id)
                .order('position', { ascending: false })
                .limit(1);
            const nextPosition = maxData && maxData.length > 0 && maxData[0].position !== null
                ? maxData[0].position + 1
                : 0;

            const { error } = await supabase.from('cards').insert([{
                name,
                set_name: setNameVal,
                price: finalPrice,
                cardmarket_url: cardmarketUrl || null,
                image_path,
                list_id: targetList.id,
                user_id: user.id,
                position: nextPosition,
            }]).select();

            if (error) throw error;

            alert('Card added');
            setName(''); setSetNameVal(''); setPrice(''); setFile(null);
            router.push('/');
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : JSON.stringify(err));
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
            <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Card name"
                required
                maxLength={32}
                className="w-full p-2 border border-gray-300 rounded-lg"
            />
            <input
                value={setNameVal}
                onChange={e => setSetNameVal(e.target.value)}
                placeholder="Set name (optional)"
                maxLength={35}
                className="w-full p-2 border border-gray-300 rounded-lg"
            />
            <input
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="Price (e.g. 12,50 or 12.50)"
                className="w-full p-2 border border-gray-300 rounded-lg"
            />
            <input
                type="url"
                value={cardmarketUrl}
                onChange={e => setCardmarketUrl(e.target.value)}
                placeholder="Cardmarket URL (optional)"
                className="w-full p-2 border border-gray-300 rounded-lg"
            />
            <select
                value={selectedList}
                onChange={e => setSelectedList(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
            >
                {lists.map(list => (
                    <option key={list.id} value={list.name}>{list.name}</option>
                ))}
            </select>
            <input
                type="file"
                accept="image/*"
                onChange={e => setFile(e.target.files?.[0] ?? null)}
                className="w-full p-2 border border-gray-300 rounded-lg"
            />
            <button
                disabled={loading}
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-full border border-blue-700 hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium shadow-sm"
            >
                {loading ? 'Adding...' : 'Add card'}
            </button>
        </form>
    );
}
