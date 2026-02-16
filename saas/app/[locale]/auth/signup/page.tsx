'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Music2, Loader2, Mail, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function SignIn() {
    const supabase = createClientComponentClient();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isSignUp, setIsSignUp] = useState(true);

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (isSignUp) {
                // Sign up
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                });

                if (error) throw error;
                setMessage({ type: 'success', text: 'Check your email to confirm your account!' });
            } else {
                // Sign in
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) throw error;
                window.location.href = '/dashboard';
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'An error occurred' });
        } finally {
            setLoading(false);
        }
    };

    const handleMagicLink = async () => {
        if (!email) {
            setMessage({ type: 'error', text: 'Please enter your email' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) throw error;
            setMessage({ type: 'success', text: 'Magic link sent! Check your email.' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to send magic link' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-3xl font-bold text-purple-600">
                        <Music2 className="h-10 w-10" />
                        Favatis
                    </Link>
                    <p className="mt-3 text-gray-600">
                        {isSignUp ? 'Create your account' : 'Sign in to your account'}
                    </p>
                </div>

                {/* Sign In Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                    <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">
                        {isSignUp ? 'Join Favatis' : 'Welcome Back'}
                    </h1>

                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                minLength={6}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                            />
                        </div>

                        {message && (
                            <div className={`p-4 rounded-xl text-sm ${message.type === 'success'
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    {isSignUp ? 'Create Account' : 'Sign In'}
                                    <ArrowRight className="h-5 w-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <button
                            onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
                            className="flex items-center justify-center py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium"
                        >
                            <img src="https://www.svgrepo.com/show/355037/google.svg" className="h-5 w-5" alt="Google" />
                        </button>
                        <button
                            onClick={() => supabase.auth.signInWithOAuth({ provider: 'spotify' })}
                            className="flex items-center justify-center py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium"
                        >
                            <img src="https://www.svgrepo.com/show/448250/spotify.svg" className="h-5 w-5" alt="Spotify" />
                        </button>
                        <button
                            onClick={() => supabase.auth.signInWithOAuth({ provider: 'apple' })}
                            className="flex items-center justify-center py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium"
                        >
                            <img src="https://www.svgrepo.com/show/448203/apple.svg" className="h-5 w-5" alt="Apple" />
                        </button>
                    </div>

                    <div className="mt-4">
                        <button
                            onClick={handleMagicLink}
                            disabled={loading}
                            className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <Mail className="h-5 w-5" />
                            Send Magic Link
                        </button>
                    </div>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-purple-600 hover:text-purple-700 font-medium"
                        >
                            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                        </button>
                    </div>
                </div>

                {/* AI Feature Badge */}
                <div className="mt-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full text-sm text-purple-700">
                        <Sparkles className="h-4 w-4" />
                        AI-Powered Artist Platform
                    </div>
                </div>
            </div>
        </div>
    );
}
