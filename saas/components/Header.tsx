'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, useRouter, usePathname } from '@/i18n/navigation';
import { Music2, User, LogOut, LayoutDashboard, Settings, ShieldCheck, Languages } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function Header() {
    const supabase = createClientComponentClient();
    const router = useRouter();
    const pathname = usePathname();
    const locale = useLocale();
    const t = useTranslations('Header');
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [scrolled, setScrolled] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);

        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUser(session.user);
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();
                setProfile(profileData);
            }
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                supabase.from('profiles').select('*').eq('id', session.user.id).single().then(({ data }) => setProfile(data));
            } else {
                setProfile(null);
            }
        });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            subscription.unsubscribe();
        };
    }, [supabase]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh();
        router.push('/');
    };

    const toggleLanguage = () => {
        const nextLocale = locale === 'en' ? 'tr' : 'en';
        router.push(pathname, { locale: nextLocale });
    };

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'backdrop-blur-xl bg-white/80 border-b border-gray-100 py-3' : 'bg-transparent py-5'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-purple-600">
                        <Music2 className="h-8 w-8" />
                        Favatis
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/artists" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                            {t('artists')}
                        </Link>
                        <Link href="/pricing" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                            {t('pricing')}
                        </Link>

                        <button
                            onClick={toggleLanguage}
                            className="flex items-center gap-1.5 text-gray-700 hover:text-purple-600 transition-colors font-medium"
                        >
                            <Languages className="h-4 w-4" />
                            {locale.toUpperCase()}
                        </button>

                        {user ? (
                            <div className="flex items-center gap-4">
                                {profile?.role === 'admin' && (
                                    <Link
                                        href="/admin"
                                        className="flex items-center gap-1.5 text-amber-600 hover:text-amber-700 font-bold bg-amber-50 px-3 py-1.5 rounded-lg transition-all"
                                    >
                                        <ShieldCheck className="h-4 w-4" />
                                        {t('admin')}
                                    </Link>
                                )}
                                <Link
                                    href="/dashboard"
                                    className="flex items-center gap-1.5 text-purple-600 hover:text-purple-700 font-bold bg-purple-50 px-3 py-1.5 rounded-lg transition-all"
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    {t('dashboard')}
                                </Link>
                                <div className="h-8 w-px bg-gray-200 mx-2" />
                                <button
                                    onClick={handleSignOut}
                                    className="text-gray-500 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50"
                                    title={t('signOut')}
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link href="/auth/signin" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                                    {t('login')}
                                </Link>
                                <Link
                                    href="/auth/signup"
                                    className="bg-purple-600 text-white px-6 py-2.5 rounded-full font-medium hover:bg-purple-700 transition-all shadow-lg shadow-purple-100"
                                >
                                    {t('getStarted')}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
