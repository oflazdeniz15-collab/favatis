import { Music2, User, ArrowRight, Filter, Search } from 'lucide-react';
import Header from '@/components/Header';
import { useTranslations, useLocale } from 'next-intl';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Link } from '@/i18n/navigation';

export const dynamic = 'force-dynamic';

export default async function ArtistsPage({
    params: { locale },
    searchParams
}: {
    params: { locale: string };
    searchParams: { genre?: string; minPrice?: string; maxPrice?: string; sort?: string };
}) {
    const t = useTranslations('Artists');
    const supabase = createServerComponentClient({ cookies });

    // Build Supabase Query
    let query = supabase
        .from('artists')
        .select('*')
        .eq('is_approved', true);

    if (searchParams.genre && searchParams.genre !== 'all') {
        query = query.filter('genre', 'ilike', `%${searchParams.genre}%`);
    }

    if (searchParams.sort === 'newest') {
        query = query.order('created_at', { ascending: false });
    } else if (searchParams.sort === 'popular') {
        query = query.order('subscriber_count', { ascending: false });
    } else {
        query = query.order('artist_name', { ascending: true });
    }

    const { data: artists, error } = await query;

    const genres = ['all', 'rock', 'pop', 'indie'];
    const sortOptions = ['newest', 'popular'];

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Header />

            <main className="pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <div>
                            <h1 className="text-4xl font-bold font-display mb-2 text-white">
                                {t('title')}
                            </h1>
                            <p className="text-gray-400">
                                {t('subtitle')}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                        {/* Filters Sidebar */}
                        <aside className="lg:col-span-1 space-y-8">
                            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
                                <div className="flex items-center gap-2 mb-6 text-purple-400 font-bold">
                                    <Filter className="h-5 w-5" />
                                    {t('filters')}
                                </div>

                                {/* Genre Filter */}
                                <div className="mb-8">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                                        {t('genre')}
                                    </h3>
                                    <div className="space-y-3">
                                        {genres.map((g) => (
                                            <Link
                                                key={g}
                                                href={`/artists?genre=${g}`}
                                                className={`block px-4 py-2 rounded-xl transition-all ${(searchParams.genre || 'all') === g
                                                        ? 'bg-purple-600 text-white font-bold'
                                                        : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                                                    }`}
                                            >
                                                {t(g)}
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                {/* Sorting */}
                                <div className="mb-8">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                                        {t('sortBy')}
                                    </h3>
                                    <div className="space-y-3">
                                        {sortOptions.map((s) => (
                                            <Link
                                                key={s}
                                                href={`/artists?sort=${s}`}
                                                className={`block px-4 py-2 rounded-xl transition-all ${searchParams.sort === s
                                                        ? 'bg-purple-600 text-white font-bold'
                                                        : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                                                    }`}
                                            >
                                                {t(s)}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Artist Grid */}
                        <div className="lg:col-span-3">
                            {artists && artists.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {artists.map((artist) => (
                                        <div key={artist.id} className="group bg-gray-800/30 border border-gray-700/50 rounded-3xl overflow-hidden hover:border-purple-500/50 transition-all hover:shadow-2xl hover:shadow-purple-500/10">
                                            <div className="relative h-64">
                                                <img
                                                    src={artist.avatar_url || 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80&w=800'}
                                                    alt={artist.artist_name}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-purple-400 border border-gray-700">
                                                    {artist.genre}
                                                </div>
                                            </div>
                                            <div className="p-8">
                                                <h3 className="text-2xl font-bold mb-2 group-hover:text-purple-400 transition-colors">
                                                    {artist.artist_name}
                                                </h3>
                                                <p className="text-gray-400 text-sm mb-6 line-clamp-2">
                                                    {artist.bio || 'Professional musician on Favatis Platform.'}
                                                </p>
                                                <div className="flex items-center justify-between border-t border-gray-700/50 pt-6">
                                                    <div>
                                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                                                            {t('startingPrice')}
                                                        </p>
                                                        <span className="text-xl font-bold text-white">
                                                            {locale === 'en' ? '€' : 'TL'}{artist.starting_price || 0}
                                                        </span>
                                                    </div>
                                                    <div className="text-right text-sm text-gray-500">
                                                        <div className="flex items-center gap-1.5 justify-end mb-1">
                                                            <User className="h-4 w-4" />
                                                            {artist.subscriber_count || 0}
                                                        </div>
                                                        Fans
                                                    </div>
                                                </div>
                                                <Link
                                                    href={`/artists/${artist.id}`}
                                                    className="w-full mt-6 py-4 bg-purple-600/10 text-purple-400 border border-purple-500/20 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-purple-600 hover:text-white transition-all group/btn"
                                                >
                                                    {t('viewProfile')}
                                                    <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-gray-800/20 rounded-3xl border border-gray-700/50">
                                    <div className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Search className="h-10 w-10 text-gray-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{t('noArtists')}</h3>
                                    <Link href="/artists" className="text-purple-400 hover:text-purple-300 font-medium">
                                        Clear all filters
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
