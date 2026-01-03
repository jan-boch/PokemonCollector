import '../styles/globals.css';
import type { AppProps } from 'next/app';
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/router';
import CardLists from '../components/CardLists';

export default function App({ Component, pageProps }: AppProps) {
    const [user, setUser] = useState<any>(null);
    const [mode, setMode] = useState<'view' | 'delete' | 'edit'>('view');
    const [lists, setLists] = useState<any[]>([]);
    const [activeList, setActiveList] = useState<string>('');
    const router = useRouter();
    const lastUserId = useRef<string | null>(null);

    useEffect(() => {
        const handleAuthStateChange = async (event: any, session: any) => {
            const currentUser = session?.user ?? null;
            
            if (!currentUser) {
                if (lastUserId.current !== null) {
                    setUser(null);
                    setLists([]);
                    setActiveList('');
                    lastUserId.current = null;
                }
                return;
            }

            // If it's the same user, just update the session data but don't re-fetch lists
            if (lastUserId.current === currentUser.id) {
                setUser(currentUser);
                return;
            }

            lastUserId.current = currentUser.id;
            setUser(currentUser);

            console.log('User changed or initial login, fetching lists...');
            const { data: fetchedLists, error } = await supabase
                .from('lists')
                .select('id, name')
                .eq('user_id', currentUser.id);

            if (error) {
                console.error('Error fetching lists:', error);
                return;
            }

            if (fetchedLists && fetchedLists.length > 0) {
                setLists(fetchedLists);
                
                setActiveList(current => {
                    if (current && fetchedLists.some(l => l.name === current)) {
                        return current;
                    }
                    const hasBase = fetchedLists.some(l => l.name === 'Base');
                    return hasBase ? 'Base' : fetchedLists[0].name;
                });
            } else {
                const { data: newList, error: insertError } = await supabase
                    .from('lists')
                    .insert([{ name: 'Base', user_id: currentUser.id }])
                    .select()
                    .single();

                if (!insertError && newList) {
                    setLists([newList]);
                    setActiveList('Base');
                }
            }
        };

        // Initial check
        supabase.auth.getSession().then(({ data: { session } }) => {
            handleAuthStateChange(null, session);
        });

        const { data: listener } = supabase.auth.onAuthStateChange(handleAuthStateChange);

        return () => listener?.subscription.unsubscribe();
    }, []);

    async function logout() {
        await supabase.auth.signOut();
        setUser(null);
        setMode('view');
        await router.push('/');
    }

    const setModeHandler = (newMode: typeof mode) => {
        setMode(currentMode => (currentMode === newMode ? 'view' : newMode));
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-md">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">
                        <Link href="/" className="text-gray-800 hover:text-gray-600">
                            Pokémon Collection
                        </Link>
                    </h1>
                    <nav className="flex items-center space-x-2">
                        {user ? (
                            <>
                                <button
                                    onClick={() => router.push('/add')}
                                    className="px-4 py-2 rounded-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm shadow-sm"
                                >
                                    Add Card
                                </button>
                                <button
                                    onClick={() => setModeHandler('edit')}
                                    className={`px-4 py-2 rounded-full transition-colors font-medium text-sm shadow-sm ${
                                        mode === 'edit'
                                            ? 'bg-blue-600 text-white border border-blue-600'
                                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => setModeHandler('delete')}
                                    className={`px-4 py-2 rounded-full transition-colors font-medium text-sm shadow-sm ${
                                        mode === 'delete'
                                            ? 'bg-red-600 text-white border border-red-600'
                                            : 'bg-white border border-gray-300 text-red-600 hover:bg-red-50'
                                    }`}
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={logout}
                                    className="px-4 py-2 rounded-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm shadow-sm"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => router.push('/login')}
                                className="px-4 py-2 rounded-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm shadow-sm"
                            >
                                Login
                            </button>
                        )}
                    </nav>
                </div>
            </header>
            {user && (
                <CardLists
                    user={user}
                    lists={lists}
                    setLists={setLists}
                    activeList={activeList}
                    setActiveList={setActiveList}
                />
            )}
            <main className="container mx-auto p-4">
                <Component
                    {...pageProps}
                    user={user}
                    mode={mode}
                    setMode={setMode}
                    activeList={activeList}
                    lists={lists}
                    setLists={setLists}
                />
            </main>
        </div>
    );
}