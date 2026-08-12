import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Login() {
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    async function signInWithGoogle() {
        setLoading(true);
        setErrorMsg('');

        const redirectToUrl = process.env.NODE_ENV === 'development'
            ? 'http://localhost:3000/'
            : `${process.env.NEXT_PUBLIC_APP_URL}/`;

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: redirectToUrl },
        });

        if (error) {
            setLoading(false);
            setErrorMsg(error.message);
        }
        // On success the browser is redirected to Google, so leave loading on.
    }

    return (
        <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold mb-1 text-gray-900 text-center">Sign in</h2>
            <p className="text-sm text-gray-400 text-center mb-6">Use your Google account to continue.</p>
            {errorMsg && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
                    {errorMsg}
                </p>
            )}
            <button
                onClick={signInWithGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-2.5 px-4 rounded-full hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors font-semibold shadow-sm"
            >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 12 1 11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                {loading ? 'Redirecting…' : 'Continue with Google'}
            </button>
        </div>
    );
}
