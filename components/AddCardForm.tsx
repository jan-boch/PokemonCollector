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

    const inputClass = "w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <form onSubmit={onSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div>
                <label className={labelClass}>Card name *</label>
                <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Charizard"
                    required
                    maxLength={32}
                    className={inputClass}
                />
            </div>
            <div>
                <label className={labelClass}>Set name</label>
                <input
                    value={setNameVal}
                    onChange={e => setSetNameVal(e.target.value)}
                    placeholder="e.g. Base Set"
                    maxLength={35}
                    className={inputClass}
                />
            </div>
            <div>
                <label className={labelClass}>Price</label>
                <input
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    placeholder="e.g. 12,50"
                    className={inputClass}
                />
            </div>
            <div>
                <label className={labelClass}>Cardmarket URL</label>
                <input
                    type="url"
                    value={cardmarketUrl}
                    onChange={e => setCardmarketUrl(e.target.value)}
                    placeholder="https://www.cardmarket.com/..."
                    className={inputClass}
                />
            </div>
            <div>
                <label className={labelClass}>List</label>
                <div className="relative">
                    <select
                        value={selectedList}
                        onChange={e => setSelectedList(e.target.value)}
                        className={`${inputClass} bg-white appearance-none pr-9`}
                    >
                        {lists.map(list => (
                            <option key={list.id} value={list.name}>{list.name}</option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>
            <div>
                <label className={labelClass}>Card image</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={e => setFile(e.target.files?.[0] ?? null)}
                    className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer"
                />
            </div>
            <button
                disabled={loading}
                type="submit"
                className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-full hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold shadow-sm"
            >
                {loading ? 'Adding...' : 'Add Card'}
            </button>
        </form>
    );
}
