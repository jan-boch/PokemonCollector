import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function App({ Component, pageProps }: AppProps) {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data.user));

        const { data: listener } = supabase.auth.onAuthStateChange(
            (_, session) => setUser(session?.user ?? null)
        );

        return () => listener?.subscription.unsubscribe();
    }, []);


    async function logout() {
        await supabase.auth.signOut();
        setUser(null);
        await router.push('/');
    }

    return (
        <div className="container">
            <header style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem' }}>
                <h1><Link href="/">Pokémon Collection</Link></h1>
                <nav>
                    {user ? (
                        <>
                            <Link href="/add">Add card</Link>
                            {' | '}
                            <button
                                onClick={logout}
                                style={{
                                    cursor: 'pointer',
                                    background: 'none',
                                    border: 'none',
                                    color: 'blue',
                                    textDecoration: 'underline'
                                }}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link href="/login">Login</Link>
                    )}
                </nav>
            </header>
            <main style={{ padding: '1rem' }}>
                <Component {...pageProps} user={user} />
            </main>
        </div>
    );
}
