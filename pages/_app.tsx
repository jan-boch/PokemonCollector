import '../styles/globals.css';
import type { AppProps } from 'next/app';
import React, { useEffect, useState, useRef } from 'react';
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/router';
import CardLists from '../components/CardLists';
import type { List } from '../lib/types';

export default function App({ Component, pageProps }: AppProps) {
    const [user, setUser] = useState<User | null>(null);
    const [mode, setMode] = useState<'view' | 'delete' | 'edit'>('view');
    const [lists, setLists] = useState<List[]>([]);
    const [activeList, setActiveList] = useState<string>('');
    const [listsLoading, setListsLoading] = useState(false);
    const router = useRouter();
    const lastUserId = useRef<string | null>(null);

    const handleSetActiveList = (list: string) => {
        setActiveList(list);
        localStorage.setItem('activeList', list);
    };

    useEffect(() => {
        const handleAuthStateChange = async (_event: AuthChangeEvent | null, session: Session | null) => {
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
            setListsLoading(true);

            const { data: fetchedLists, error } = await supabase
                .from('lists')
                .select('id, name')
                .eq('user_id', currentUser.id);

            if (error) {
                console.error('Error fetching lists:', error);
                setListsLoading(false);
                return;
            }

            if (fetchedLists && fetchedLists.length > 0) {
                setLists(fetchedLists);

                setActiveList(current => {
                    if (current && fetchedLists.some(l => l.name === current)) {
                        return current;
                    }
                    const saved = localStorage.getItem('activeList');
                    if (saved && fetchedLists.some(l => l.name === saved)) {
                        return saved;
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
                    handleSetActiveList('Base');
                }
            }
            setListsLoading(false);
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
        <div className="min-h-screen bg-slate-50">
            <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center gap-4">
                    <Link href="/" className="flex items-center gap-2.5 shrink-0" title="Go to collection">
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="shrink-0">
                            <path d="M1.5 14a12.5 12.5 0 0 1 25 0" fill="#ef4444" />
                            <path d="M1.5 14a12.5 12.5 0 0 0 25 0" fill="white" />
                            <circle cx="14" cy="14" r="12.5" stroke="#1f2937" strokeWidth="1.5" />
                            <line x1="1.5" y1="14" x2="26.5" y2="14" stroke="#1f2937" strokeWidth="1.5" />
                            <circle cx="14" cy="14" r="4" fill="white" stroke="#1f2937" strokeWidth="1.5" />
                            <circle cx="14" cy="14" r="1.8" fill="#1f2937" />
                        </svg>
                        <span className="text-lg font-bold text-gray-900">
                            Pokémon Tracker
                        </span>
                    </Link>

                    <nav className="flex items-center gap-2">
                        {user ? (
                            <>
                                <button
                                    onClick={() => router.push('/add')}
                                    className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-sm"
                                >
                                    + Add Card
                                </button>

                                <div className="flex rounded-full border border-gray-200 divide-x divide-gray-200 overflow-hidden">
                                    <button
                                        onClick={() => setModeHandler('edit')}
                                        className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                                            mode === 'edit'
                                                ? 'bg-indigo-600 text-white'
                                                : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => setModeHandler('delete')}
                                        className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                                            mode === 'delete'
                                                ? 'bg-red-500 text-white'
                                                : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        Delete
                                    </button>
                                </div>

                                <button
                                    onClick={() => router.push('/lists')}
                                    className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    Lists
                                </button>
                                <button
                                    onClick={logout}
                                    className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => router.push('/login')}
                                className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-sm"
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
                    setActiveList={handleSetActiveList}
                />
            )}

            <main className="container mx-auto px-4 md:px-8 lg:px-16 py-8">
                <Component
                    {...pageProps}
                    user={user}
                    mode={mode}
                    setMode={setMode}
                    activeList={activeList}
                    setActiveList={handleSetActiveList}
                    lists={lists}
                    setLists={setLists}
                    listsLoading={listsLoading}
                />
            </main>
        </div>
    );
}