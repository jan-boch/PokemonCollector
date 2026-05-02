import React, { useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import CardGrid from '../components/CardGrid';
import { useRouter } from 'next/router';
import type { Card, List } from '../lib/types';
import { sortCards, SORT_OPTIONS } from '../lib/sortCards';
import type { SortField } from '../lib/sortCards';

export default function Home({ user, mode, activeList, lists, listsLoading }: { user: User | null, mode: 'view' | 'delete' | 'edit', activeList: string, lists: List[], listsLoading: boolean }) {
    const [cards, setCards] = useState<Card[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<SortField>('position');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [sortOpen, setSortOpen] = useState(false);
    const sortRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const prevActiveList = React.useRef(activeList);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
                setSortOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        let isMounted = true;
        async function loadData() {
            if (!user?.id || listsLoading) {
                return;
            }

            if (!activeList || lists.length === 0) {
                if (isMounted) {
                    setCards([]);
                    setLoading(false);
                }
                return;
            }

            if (prevActiveList.current !== activeList) {
                if (isMounted) setLoading(true);
            }

            try {
                const activeListData = lists.find(list => list.name === activeList);

                if (activeListData) {
                    const { data, error } = await supabase
                        .from('cards')
                        .select('*')
                        .eq('list_id', activeListData.id)
                        .order('position', { ascending: true, nullsFirst: false });

                    if (error) {
                        console.error('Supabase fetch error:', error);
                        if (isMounted) setCards([]);
                    } else {
                        if (isMounted) setCards(data ?? []);
                    }
                } else {
                    if (isMounted) setCards([]);
                }
            } catch (err) {
                console.error('Unexpected error in loadData:', err);
                if (isMounted) setCards([]);
            } finally {
                if (isMounted) {
                    setLoading(false);
                    prevActiveList.current = activeList;
                }
            }
        }

        loadData();
        return () => { isMounted = false; };
    }, [user?.id, activeList, lists, listsLoading]);

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <svg width="88" height="88" viewBox="0 0 80 80" fill="none" className="mb-8 drop-shadow-lg">
                    <path d="M4 40a36 36 0 0 1 72 0" fill="#ef4444" />
                    <path d="M4 40a36 36 0 0 0 72 0" fill="white" />
                    <circle cx="40" cy="40" r="36" stroke="#1f2937" strokeWidth="3.5" />
                    <line x1="4" y1="40" x2="76" y2="40" stroke="#1f2937" strokeWidth="3.5" />
                    <circle cx="40" cy="40" r="11" fill="white" stroke="#1f2937" strokeWidth="3.5" />
                    <circle cx="40" cy="40" r="5" fill="#1f2937" />
                </svg>

                <h2 className="text-4xl font-bold text-gray-900 mb-3">
                    Pokémon Card Tracker
                </h2>
                <p className="text-gray-500 max-w-sm mb-8 leading-relaxed">
                    Keep track of your entire collection — what you own and what you still need.
                </p>

                <button
                    onClick={() => router.push('/login')}
                    className="px-8 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors shadow-md"
                >
                    Get Started →
                </button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-indigo-600 mb-4"></div>
                <p className="text-sm text-gray-400 font-medium">Loading your collection…</p>
            </div>
        );
    }

    const collectedCount = cards.filter(c => c.collected).length;
    const totalCount = cards.length;
    const progress = totalCount > 0 ? (collectedCount / totalCount) * 100 : 0;
    const displayCards = sortCards(cards, sortBy, sortDir);

    return (
        <div className="py-2">
            {totalCount === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <svg width="56" height="56" viewBox="0 0 80 80" fill="none" className="mb-5 opacity-25">
                        <path d="M4 40a36 36 0 0 1 72 0" fill="#6366f1" />
                        <path d="M4 40a36 36 0 0 0 72 0" fill="white" />
                        <circle cx="40" cy="40" r="36" stroke="#6366f1" strokeWidth="4" />
                        <line x1="4" y1="40" x2="76" y2="40" stroke="#6366f1" strokeWidth="4" />
                        <circle cx="40" cy="40" r="11" fill="white" stroke="#6366f1" strokeWidth="4" />
                        <circle cx="40" cy="40" r="5" fill="#6366f1" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">No cards yet</h3>
                    <p className="text-sm text-gray-400 mb-6">Add your first card to start building this list.</p>
                    <button
                        onClick={() => router.push('/add')}
                        className="px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-sm"
                    >
                        + Add Your First Card
                    </button>
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between gap-3 mb-5 px-1">
                        <div className="flex items-center gap-2">
                            <div className="relative" ref={sortRef}>
                                <button
                                    onClick={() => setSortOpen(o => !o)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                                >
                                    <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M6 12h12M10 17h4" />
                                    </svg>
                                    <span>{SORT_OPTIONS.find(o => o.value === sortBy)?.label}</span>
                                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {sortOpen && (
                                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-20 min-w-max">
                                        {SORT_OPTIONS.map(option => (
                                            <button
                                                key={option.value}
                                                onClick={() => { setSortBy(option.value); setSortOpen(false); }}
                                                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                                    sortBy === option.value
                                                        ? 'text-indigo-600 font-semibold bg-indigo-50'
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {sortBy !== 'position' && (
                                <button
                                    onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
                                    className="w-8 h-8 flex items-center justify-center text-gray-500 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                                    title={sortDir === 'asc' ? 'Ascending' : 'Descending'}
                                >
                                    {sortDir === 'asc' ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9M3 12h9m2-4l-4-4m4 4l-4 4" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9M3 12h9m2 4l-4 4m4-4l-4-4" />
                                        </svg>
                                    )}
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-28 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className="text-sm font-medium text-gray-500 tabular-nums">
                                <span className="text-indigo-600 font-semibold">{collectedCount}</span>
                                <span className="text-gray-400"> / {totalCount}</span>
                            </span>
                        </div>
                    </div>
                    <CardGrid
                        initialCards={displayCards}
                        mode={mode}
                        setCards={setCards}
                        disableDrag={sortBy !== 'position'}
                    />
                </>
            )}
        </div>
    );
}
