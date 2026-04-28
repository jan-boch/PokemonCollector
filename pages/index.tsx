import React, { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import CardGrid from '../components/CardGrid';
import { useRouter } from 'next/router';
import type { Card, List } from '../lib/types';

export default function Home({ user, mode, setMode, activeList, lists, listsLoading }: { user: User | null, mode: 'view' | 'delete' | 'edit', setMode: (mode: 'view' | 'delete' | 'edit' ) => void, activeList: string, lists: List[], listsLoading: boolean }) {
    const [cards, setCards] = useState<Card[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const prevActiveList = React.useRef(activeList);

    useEffect(() => {
        let isMounted = true;
        async function loadData() {
            if (!user?.id || listsLoading) {
                // Still waiting for lists to load — keep spinner
                return;
            }

            if (!activeList || lists.length === 0) {
                if (isMounted) {
                    setCards([]);
                    setLoading(false);
                }
                return;
            }

            // Only show full loading if the list has actually changed
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
            <div className="text-center p-12 bg-white rounded-lg shadow-md">
                <h2 className="text-3xl font-bold mb-4">Welcome to Your Pokémon Card Tracker!</h2>
                <p className="text-lg text-gray-600 mb-2">
                    Log in to start managing and viewing your personal collection.
                </p>
                <p className="text-gray-500">
                    You can sign in using the <strong>Login</strong> link in the header.
                </p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-500 font-medium">Loading your collection...</p>
            </div>
        );
    }

    return (
        <div className="py-6">
            {cards.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="text-5xl mb-4">🎴</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Your collection is empty</h3>
                    <p className="text-gray-500 mb-6">Start adding your favorite Pokémon cards to track them!</p>
                    <button
                        onClick={() => router.push('/add')}
                        className="inline-flex items-center px-6 py-3 rounded-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium shadow-md"
                    >
                        Add Your First Card
                    </button>
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-end mb-4 px-1">
                        <span className="text-sm font-medium text-gray-500">
                            Collected:&nbsp;
                            <span className="text-blue-600 font-semibold">
                                {cards.filter(c => c.collected).length}
                            </span>
                            <span className="text-gray-400"> / {cards.length}</span>
                        </span>
                    </div>
                    <CardGrid
                        initialCards={cards}
                        mode={mode}
                        setMode={setMode}
                        setCards={setCards}
                    />
                </>
            )}
        </div>
    );
}
