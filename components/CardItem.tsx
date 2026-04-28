import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import type { Card } from '../lib/types';

interface CardItemProps {
    card: Card;
    onUpdate: (c: Card) => void;
    mode: 'view' | 'delete' | 'edit';
    onDelete: (id: string) => void;
}

function formatPrice(price: number | null): string {
    if (price === null || price === undefined) return '-';
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(price);
}

export default function CardItem({ card, onUpdate, mode, onDelete }: CardItemProps) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const imageUrl = card.image_path && supabaseUrl
        ? `${supabaseUrl}/storage/v1/object/public/card-images/${card.image_path}`
        : null;
    const { cardmarket_url } = card;
    const [updating, setUpdating] = useState(false);
    const [pendingDelete, setPendingDelete] = useState(false);

    async function toggleCollected() {
        if (updating) return;
        setUpdating(true);
        const { data, error } = await supabase
            .from('cards')
            .update({ collected: !card.collected })
            .eq('id', card.id)
            .select()
            .single();
        setUpdating(false);
        if (error) return alert(error.message);
        onUpdate(data);
    }

    const cardImage = imageUrl ? (
        <Image
            src={imageUrl}
            alt={card.name}
            unoptimized
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 25vw, 20vw"
            className="object-contain p-2"
        />
    ) : null;

    return (
        <div className={`relative bg-white rounded-2xl overflow-hidden flex flex-col shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 ${
            card.collected ? 'ring-2 ring-green-400' : 'ring-1 ring-gray-100'
        }`}>

            {mode === 'delete' && !pendingDelete && (
                <button
                    onClick={() => setPendingDelete(true)}
                    className="absolute top-2 right-2 z-10 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow"
                    title={`Delete ${card.name}`}
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
            {mode === 'delete' && pendingDelete && (
                <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
                    <button
                        onClick={() => { onDelete(card.id); setPendingDelete(false); }}
                        className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-full transition-colors shadow"
                    >
                        Delete
                    </button>
                    <button
                        onClick={() => setPendingDelete(false)}
                        className="px-2 py-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-semibold rounded-full transition-colors shadow"
                    >
                        Cancel
                    </button>
                </div>
            )}

            {mode === 'edit' && (
                <Link
                    href={`/update/${card.id}`}
                    className="absolute top-2 right-2 z-10 w-7 h-7 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center transition-colors shadow"
                    title={`Edit ${card.name}`}
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                </Link>
            )}

            <div className="relative h-52 bg-gray-50">
                {imageUrl ? (
                    cardmarket_url ? (
                        <a href={cardmarket_url} target="_blank" rel="noopener noreferrer" className="absolute inset-0">
                            {cardImage}
                        </a>
                    ) : (
                        cardImage
                    )
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-gray-300">
                        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M2 12h20" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                        <span className="text-xs font-medium">No image</span>
                    </div>
                )}
            </div>

            <div className="px-3 pb-3 pt-2 flex flex-col flex-1">
                <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">{card.name}</h3>
                {card.set_name && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{card.set_name}</p>
                )}
                <div className="mt-auto pt-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-800">{formatPrice(card.price)}</span>
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={card.collected}
                            onChange={toggleCollected}
                            disabled={mode === 'delete' || updating}
                            className="w-4 h-4 accent-green-500 cursor-pointer disabled:cursor-not-allowed"
                        />
                        <span className={`text-xs font-medium ${card.collected ? 'text-green-600' : 'text-gray-400'}`}>
                            {card.collected ? 'Got it' : 'Want it'}
                        </span>
                    </label>
                </div>
            </div>
        </div>
    );
}
