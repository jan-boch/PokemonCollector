import React, { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';
import type { Card, List } from '../lib/types';

export default function UpdateCardForm({ initialData, user, lists }: { initialData: Card, user: User, lists: List[] }) {
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
            const { error: removeError } = await supabase.storage.from('card-images').remove([initialData.image_path]);
            if (removeError) console.error('Failed to delete old image:', removeError);
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
                    list_id: targetList.id,
                })
                .eq('id', initialData.id);

            if (error) throw error;

            router.push('/');
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : JSON.stringify(err));
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card name</label>
                <input 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="Card name" 
                    required 
                    maxLength={32}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Set name (optional)</label>
                <input 
                    value={setNameVal} 
                    onChange={e => setSetNameVal(e.target.value)} 
                    placeholder="Set name" 
                    maxLength={35}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input 
                    type="text" 
                    value={price} 
                    onChange={e => setPrice(e.target.value)} 
                    placeholder="Price (e.g. 12,50)"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cardmarket URL (optional)</label>
                <input 
                    type="url" 
                    value={cardmarketUrl} 
                    onChange={e => setCardmarketUrl(e.target.value)} 
                    placeholder="https://..."
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">List</label>
                <div className="relative">
                    <select
                        value={selectedList}
                        onChange={e => setSelectedList(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm bg-white appearance-none pr-9"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                {initialData.image_path && (
                    <p className="text-xs text-gray-500 mb-2 truncate">Current: {initialData.image_path}</p>
                )}
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
                {loading ? 'Saving...' : 'Save Changes'}
            </button>
        </form>
    );
}
