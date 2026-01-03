import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';


export default function Login() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();


    async function signInWithEmail(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        // --- 1. Define the redirect URL ---
        // This tells Supabase where to send the user AFTER they click the email link.
        // The URL needs to be absolute (start with http/https) in a real deployment,
        // but for local development, you can often use a relative path like '/'.
        // Let's use the homepage ('/') as the clean destination.
        const redirectToUrl = process.env.NODE_ENV === 'development'
            ? 'http://localhost:3000/' // Adjust port if needed
            : 'YOUR_PRODUCTION_URL/'; // IMPORTANT: Change this for deployment

        // --- 2. Pass the redirectTo parameter to signInWithOtp ---
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: redirectToUrl
            }
        });

        setLoading(false);
        if (error) alert(error.message);
        else alert('Check your email for the sign-in link');
    }

    return (
        <div style={{ maxWidth: 480 }}>
            <h2>Sign in / Sign up</h2>
            <form onSubmit={signInWithEmail}>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                <button disabled={loading} type="submit">Submit</button>
            </form>
        </div>
    );
}
