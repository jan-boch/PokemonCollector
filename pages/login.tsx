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
        <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Sign in / Sign up</h2>
            <form onSubmit={signInWithEmail} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input 
                        type="email"
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="you@example.com" 
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                </div>
                <button 
                    disabled={loading} 
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-full border border-blue-700 hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium shadow-md"
                >
                    {loading ? 'Sending link...' : 'Send Magic Link'}
                </button>
            </form>
            <p className="mt-4 text-sm text-gray-500 text-center">
                We'll email you a magic link for a password-free sign in.
            </p>
        </div>
    );
}
