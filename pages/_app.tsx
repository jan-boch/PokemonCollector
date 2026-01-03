import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function App({ Component, pageProps }: AppProps) {
    const [user, setUser] = useState<any>(null);
    // New state to manage the active mode for the CardGrid
    const [mode, setMode] = useState<'view' | 'delete' | 'edit'>('view');
    const router = useRouter();

    useEffect(() => {
        // ... (auth setup remains the same)
        supabase.auth.getUser().then(({ data }) => setUser(data.user));

        const { data: listener } = supabase.auth.onAuthStateChange(
            (_, session) => setUser(session?.user ?? null)
        );

        return () => listener?.subscription.unsubscribe();
    }, []);

    // ... (logout function remains the same)
    async function logout() {
        await supabase.auth.signOut();
        setUser(null);
        setMode('view'); // Reset mode on logout
        await router.push('/');
    }

    // Function to toggle modes
    const setModeHandler = (newMode: typeof mode) => {
        setMode(currentMode => (currentMode === newMode ? 'view' : newMode));
    };

    return (
        <div className="container">
            <header style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem' }}>
                <h1>
                    <Link
                        href="/"
                        style={{
                            color: 'inherit',
                            textDecoration: 'none'
                        }}>
                        Pokémon Collection
                    </Link>
                </h1>
                <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {user ? (
                        <>
                            <Link
                                href="/add"
                                style={{
                                    color: 'blue',
                                    textDecoration: 'none'
                                }}>
                                Add card
                            </Link>
                            {' | '}
                            {/* New Mode Buttons */}
                            <button onClick={() => setModeHandler('edit')}
                                style={{
                                    fontWeight: mode === 'edit' ? 'bold' : 'normal',
                                    cursor: 'pointer',
                                    background: 'none',
                                    border: 'none',
                                    color: 'blue',
                                    textDecoration: 'none'
                            }}>
                                Edit
                            </button>
                            {' | '}
                            <button onClick={() => setModeHandler('delete')}
                                style={{
                                    fontWeight: mode === 'delete' ? 'bold' : 'normal',
                                    cursor: 'pointer',
                                    background: 'none',
                                    border: 'none',
                                    color: 'blue',
                                    textDecoration: 'none'
                            }}>
                                Delete
                            </button>
                            {' | '}
                            <button onClick={logout}
                                style={{
                                    cursor: 'pointer',
                                    background: 'none',
                                    border: 'none',
                                    color: 'blue',
                                    textDecoration: 'none'
                                }}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link href="/login">Login</Link>
                    )}
                </nav>
            </header>
            <main style={{ padding: '1rem' }}>
                {/* Pass the mode and setMode to the component */}
                <Component {...pageProps} user={user} mode={mode} setMode={setMode} />
            </main>
        </div>
    );
}