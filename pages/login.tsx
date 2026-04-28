import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Login() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    async function signInWithEmail(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        const redirectToUrl = process.env.NODE_ENV === 'development'
            ? 'http://localhost:3000/'
            : `${process.env.NEXT_PUBLIC_APP_URL}/`;

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: redirectToUrl },
        });

        setLoading(false);
        if (error) {
            setErrorMsg(error.message);
        } else {
            setSent(true);
        }
    }

    if (sent) {
        return (
            <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-xl shadow-sm border border-gray-100 text-center">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Check your inbox</h2>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                    We sent a magic link to{' '}
                    <span className="font-semibold text-gray-700">{email}</span>.
                    <br />Click it to sign in — no password needed.
                </p>
                <button
                    onClick={() => { setSent(false); setEmail(''); }}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                >
                    Use a different email
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold mb-1 text-gray-900 text-center">Sign in</h2>
            <p className="text-sm text-gray-400 text-center mb-6">We&apos;ll send a magic link to your email.</p>
            <form onSubmit={signInWithEmail} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                    />
                </div>
                {errorMsg && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                        {errorMsg}
                    </p>
                )}
                <button
                    disabled={loading}
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-full hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold shadow-sm"
                >
                    {loading ? 'Sending…' : 'Send Magic Link'}
                </button>
            </form>
        </div>
    );
}
