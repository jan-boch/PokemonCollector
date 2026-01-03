import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import CardGrid from '../components/CardGrid';

// Update: Accept the `user` prop
export default function Home({ user, mode, setMode, activeList, lists, setLists }: { user: any, mode: 'view' | 'delete' | 'edit', setMode: (mode: 'view' | 'delete' | 'edit' ) => void, activeList: string, lists: any[], setLists: React.Dispatch<React.SetStateAction<string[]>> }) {
    const [cards, setCards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setLoading(true);

            if (user) {
                const { data: listData, error: listError } = await supabase
                    .from('lists')
                    .select('id, name')
                    .eq('user_id', user.id);

                if (listError) {
                    console.error('Error fetching lists:', listError);
                } else if (listData) {
                    setLists(listData.map(list => list.name));
                    const activeListData = listData.find(list => list.name === activeList);

                    if (activeListData) {
                        const { data, error } = await supabase
                            .from('cards')
                            .select('*')
                            .eq('list_id', activeListData.id)
                            .order('created_at', { ascending: false });

                        if (error) {
                            console.error(error);
                            setCards([]);
                        } else {
                            setCards(data ?? []);
                        }
                    } else {
                        setCards([]);
                    }
                }
            } else {
                setCards([]);
            }
            setLoading(false);
        }

        loadData();
    }, [user, activeList]);

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

    if (loading) return <p className="text-center text-gray-500">Loading your collection...</p>;

    return (
        <>
            {cards.length === 0 ? (
                <p className="text-center text-gray-500">Your collection is empty! Go to "Add card" to begin.</p>
            ) : (
                <CardGrid
                    initialCards={cards}
                    mode={mode}
                    setMode={setMode}
                    setCards={setCards}
                />
            )}
        </>
    );
}