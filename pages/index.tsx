import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import CardGrid from '../components/CardGrid';
import { useRouter } from 'next/router';

// Update: Accept the `user` prop
export default function Home({ user, mode, setMode, activeList, lists, setLists }: { user: any, mode: 'view' | 'delete' | 'edit', setMode: (mode: 'view' | 'delete' | 'edit' ) => void, activeList: string, lists: any[], setLists: React.Dispatch<React.SetStateAction<string[]>> }) {
    const [cards, setCards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const prevActiveList = React.useRef(activeList);

    useEffect(() => {
        let isMounted = true;
        async function loadData() {
            console.log('[DEBUG] loadData', { 
                user: user?.id, 
                activeList, 
                lists: lists.length,
                prevList: prevActiveList.current
            });

            if (!user || !activeList || lists.length === 0) {
                console.log('[DEBUG] skipping loadData - missing dependencies');
                if (isMounted) {
                    setCards([]);
                    setLoading(false);
                }
                return;
            }

            // Only show full loading if the list has actually changed
            if (prevActiveList.current !== activeList || cards.length === 0) {
                if (isMounted) setLoading(true);
            }
            
            try {
                const activeListData = lists.find(list => list.name === activeList);

                if (activeListData) {
                    const { data, error } = await supabase
                        .from('cards')
                        .select('*')
                        .eq('list_id', activeListData.id)
                        .order('created_at', { ascending: false });

                    if (error) {
                        console.error('Supabase fetch error:', error);
                        if (isMounted) setCards([]);
                    } else {
                        if (isMounted) setCards(data ?? []);
                    }
                } else {
                    console.warn('Active list not found in lists:', activeList);
                    if (isMounted) setCards([]);
                }
            } catch (err) {
                console.error('Unexpected error in loadData:', err);
                if (isMounted) setCards([]);
            } finally {
                if (isMounted) {
                    setLoading(false);
                    prevActiveList.current = activeList;
                    console.log('[DEBUG] loadData finished');
                }
            }
        }

        loadData();
        return () => { isMounted = false; };
    }, [user?.id, activeList, lists]);

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
                <CardGrid
                    initialCards={cards}
                    mode={mode}
                    setMode={setMode}
                    setCards={setCards}
                />
            )}
        </div>
    );
}