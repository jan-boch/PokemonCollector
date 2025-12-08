import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';


export default function Login() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();


    async function signInWithEmail(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithOtp({ email });
        setLoading(false);
        if (error) alert(error.message);
        else alert('Check your email for the sign-in link');
    }


    return (
        <div style={{ maxWidth: 480 }}>
            <h2>Sign in / Sign up</h2>
            <form onSubmit={signInWithEmail}>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                <button disabled={loading} type="submit">Send magic link</button>
            </form>
        </div>
    );
}