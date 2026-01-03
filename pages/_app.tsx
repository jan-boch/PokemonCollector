import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/router';
import CardLists from '../components/CardLists';

export default function App({ Component, pageProps }: AppProps) {
    const [user, setUser] = useState<any>(null);
    const [mode, setMode] = useState<'view' | 'delete' | 'edit'>('view');
    const [lists, setLists] = useState(['base']);
    const [activeList, setActiveList] = useState('base');
    const router = useRouter();

    useEffect(() => {
        const handleAuthStateChange = async (event: any, session: any) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser) {
                const { data: fetchedLists, error } = await supabase
                    .from('lists')
                    .select('id, name')
                    .eq('user_id', currentUser.id);

                if (error) {
                    console.error('Error fetching lists:', error);
                    setLists([]);
                    setActiveList('');
                    return;
                }

                const listNames = fetchedLists?.map(list => list.name) || [];
                setLists(listNames);

                if (listNames.length === 0) {
                    const { data: newlist, error: insertError } = await supabase
                        .from('lists')
                        .insert([{ name: 'Base', user_id: currentUser.id }])
                        .select()
                        .single();

                    if (insertError) {
                        console.error('Error creating base list:', insertError);
                        setLists([]);
                        setActiveList('');
                    } else {
                        setLists(['Base']);
                        setActiveList('Base');
                    }
                } else {
                    if (listNames.includes('Base')) {
                        setActiveList('Base');
                    } else {
                        setActiveList(listNames[0]);
                    }
                }
            } else {
                setLists([]);
                setActiveList('');
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
                    <nav className="flex items-center space-x-4">
                        {user ? (
                            <>
                                <Link href="/add" className="text-blue-500 hover:underline">
                                    Add card
                                </Link>
                                <span className="text-gray-300">|</span>
                                <button
                                    onClick={() => setModeHandler('edit')}
                                    className={`px-3 py-1 rounded ${mode === 'edit' ? 'bg-blue-500 text-white' : 'bg-transparent text-blue-500'} hover:bg-blue-600 hover:text-white transition-colors`}
                                >
                                    Edit
                                </button>
                                <span className="text-gray-300">|</span>
                                <button
                                    onClick={() => setModeHandler('delete')}
                                    className={`px-3 py-1 rounded ${mode === 'delete' ? 'bg-red-500 text-white' : 'bg-transparent text-red-500'} hover:bg-red-600 hover:text-white transition-colors`}
                                >
                                    Delete
                                </button>
                                <span className="text-gray-300">|</span>
                                <button
                                    onClick={logout}
                                    className="text-blue-500 hover:underline"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link href="/login" className="text-blue-500 hover:underline">Login</Link>
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