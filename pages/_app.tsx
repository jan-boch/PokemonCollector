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
                    <nav className="flex items-center space-x-2">
                        {user ? (
                            <>
                                <button
                                    onClick={() => router.push('/add')}
                                    className="px-4 py-2 rounded-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm shadow-sm"
                                >
                                    Add card
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