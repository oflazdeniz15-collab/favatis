'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Music2,
    User,
    CreditCard,
    BarChart3,
    Settings,
    LogOut,
    Sparkles,
    Upload,
    Users,
    TrendingUp,
    Calendar,
    Bell
} from 'lucide-react';

interface UserProfile {
    id: string;
    email: string;
    full_name: string | null;
    role: 'admin' | 'artist' | 'user';
    subscription_tier: 'free' | 'pro' | 'elite';
    is_approved: boolean;
}

export default function Dashboard() {
    const supabase = createClientComponentClient();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.push('/auth/signin');
                return;
            }

            setUser(session.user);

            // Fetch profile
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (profileData) {
                setProfile(profileData);
            }

            setLoading(false);
        };

        getUser();
    }, [supabase, router]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    const stats = [
        { label: 'Total Views', value: '12.5K', icon: BarChart3, change: '+12%' },
        { label: 'Subscribers', value: '847', icon: Users, change: '+8%' },
        { label: 'Revenue', value: '$2,450', icon: TrendingUp, change: '+23%' },
        { label: 'Content', value: '24', icon: Upload, change: '+3' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-purple-600">
                            <Music2 className="h-7 w-7" />
                            Favatis
                        </Link>
                        <div className="flex items-center gap-4">
                            <button className="p-2 rounded-full hover:bg-gray-100 relative">
                                <Bell className="h-5 w-5 text-gray-600" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center">
                                    <User className="h-5 w-5 text-purple-600" />
                                </div>
                                <div className="hidden md:block">
                                    <p className="text-sm font-medium text-gray-900">{profile?.full_name || user?.email}</p>
                                    <p className="text-xs text-gray-500 capitalize">{profile?.subscription_tier || 'Free'} Plan</p>
                                </div>
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="p-2 rounded-full hover:bg-gray-100"
                            >
                                <LogOut className="h-5 w-5 text-gray-600" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Banner */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 md:p-8 text-white mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold mb-2">
                                Welcome back, {profile?.full_name?.split(' ')[0] || 'Artist'}! 👋
                            </h1>
                            <p className="text-purple-100">
                                Ready to create amazing content for your fans?
                            </p>
                        </div>
                        <Link
                            href="/dashboard/ai-generator"
                            className="inline-flex items-center gap-2 bg-white text-purple-600 px-5 py-3 rounded-xl font-semibold hover:bg-purple-50 transition-all"
                        >
                            <Sparkles className="h-5 w-5" />
                            Generate with AI
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="bg-white rounded-xl border border-gray-200 p-5">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <stat.icon className="h-5 w-5 text-purple-600" />
                                </div>
                                <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                    {stat.change}
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            <p className="text-sm text-gray-500">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                            <Upload className="h-6 w-6 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Content</h3>
                        <p className="text-gray-600 text-sm mb-4">Share exclusive content with your subscribers.</p>
                        <button className="text-purple-600 font-medium hover:text-purple-700">
                            Upload Now →
                        </button>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4">
                            <CreditCard className="h-6 w-6 text-pink-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Upgrade Plan</h3>
                        <p className="text-gray-600 text-sm mb-4">Unlock more features with Pro or Elite plans.</p>
                        <Link href="/pricing" className="text-pink-600 font-medium hover:text-pink-700">
                            View Plans →
                        </Link>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                            <Calendar className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Schedule Content</h3>
                        <p className="text-gray-600 text-sm mb-4">Plan your content calendar in advance.</p>
                        <button className="text-blue-600 font-medium hover:text-blue-700">
                            Schedule →
                        </button>
                    </div>
                </div>

                {/* AI Generator CTA */}
                <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 rounded-2xl p-8 text-white">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                            <Sparkles className="h-8 w-8" />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-2xl font-bold mb-2">AI-Powered Content Generation</h2>
                            <p className="text-purple-200">
                                Generate compelling bios, portfolio descriptions, and social media posts with our Gemini AI integration.
                            </p>
                        </div>
                        <Link
                            href="/dashboard/ai-generator"
                            className="px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all whitespace-nowrap"
                        >
                            Try AI Generator
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
