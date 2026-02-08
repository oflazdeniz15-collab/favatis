'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import {
    Users,
    CheckCircle,
    XCircle,
    Clock,
    Search,
    Filter,
    RefreshCw,
    Mail,
    ExternalLink,
    AlertTriangle,
    Shield
} from 'lucide-react';

interface PendingArtist {
    id: string;
    email: string;
    full_name: string;
    avatar_url: string;
    artist_bio: string;
    genre: string;
    artist_portfolio_url: string;
    created_at: string;
}

interface Stats {
    totalPending: number;
    approvedToday: number;
    rejectedToday: number;
}

export default function AdminDashboard() {
    const supabase = createClientComponentClient();
    const router = useRouter();

    const [user, setUser] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [pendingArtists, setPendingArtists] = useState<PendingArtist[]>([]);
    const [stats, setStats] = useState<Stats>({ totalPending: 0, approvedToday: 0, rejectedToday: 0 });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterGenre, setFilterGenre] = useState('all');
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Check auth and admin access
    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.push('/auth/signin');
                return;
            }

            setUser(session.user);

            // Check if admin
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .single();

            if (profile?.role !== 'admin') {
                router.push('/dashboard?error=unauthorized');
                return;
            }

            setIsAdmin(true);
        };

        checkAuth();
    }, [supabase, router]);

    // Fetch pending artists
    const fetchPendingArtists = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/admin/pending-artists');

            if (!response.ok) {
                throw new Error('Failed to fetch pending artists');
            }

            const data = await response.json();
            setPendingArtists(data.artists);
            setStats(data.stats);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAdmin) {
            fetchPendingArtists();
        }
    }, [isAdmin, fetchPendingArtists]);

    // Approve artist
    const handleApprove = async (artistId: string, artistName: string) => {
        try {
            setActionLoading(artistId);
            setError(null);

            const response = await fetch('/api/admin/approve-artist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ artistId, action: 'approve' })
            });

            if (!response.ok) {
                throw new Error('Failed to approve artist');
            }

            setPendingArtists(prev => prev.filter(a => a.id !== artistId));
            setStats(prev => ({
                ...prev,
                totalPending: prev.totalPending - 1,
                approvedToday: prev.approvedToday + 1
            }));

            setSuccessMessage(`${artistName} has been approved!`);
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to approve artist');
        } finally {
            setActionLoading(null);
        }
    };

    // Reject artist
    const handleReject = async (artistId: string, artistName: string) => {
        const reason = prompt('Rejection reason (optional):');

        try {
            setActionLoading(artistId);
            setError(null);

            const response = await fetch('/api/admin/approve-artist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ artistId, action: 'reject', reason: reason || undefined })
            });

            if (!response.ok) {
                throw new Error('Failed to reject artist');
            }

            setPendingArtists(prev => prev.filter(a => a.id !== artistId));
            setStats(prev => ({
                ...prev,
                totalPending: prev.totalPending - 1,
                rejectedToday: prev.rejectedToday + 1
            }));

            setSuccessMessage(`${artistName} has been rejected.`);
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reject artist');
        } finally {
            setActionLoading(null);
        }
    };

    // Filter artists
    const filteredArtists = pendingArtists.filter(artist => {
        const matchesSearch =
            artist.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            artist.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            artist.genre?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesGenre = filterGenre === 'all' || artist.genre === filterGenre;

        return matchesSearch && matchesGenre;
    });

    // Get unique genres
    const genres = Array.from(new Set(pendingArtists.map(a => a.genre).filter(Boolean)));

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <Shield className="h-8 w-8 text-purple-600" />
                            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500">
                                Logged in as <strong>{user?.email}</strong>
                            </span>
                            <button
                                onClick={fetchPendingArtists}
                                disabled={loading}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <RefreshCw className={`h-5 w-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Pending Approval</p>
                                <p className="text-3xl font-bold text-amber-600">{stats.totalPending}</p>
                            </div>
                            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                                <Clock className="h-6 w-6 text-amber-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Approved Today</p>
                                <p className="text-3xl font-bold text-green-600">{stats.approvedToday}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Rejected Today</p>
                                <p className="text-3xl font-bold text-red-600">{stats.rejectedToday}</p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <XCircle className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                {successMessage && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700">
                        <CheckCircle className="h-5 w-5" />
                        {successMessage}
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                        <AlertTriangle className="h-5 w-5" />
                        {error}
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or genre..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="h-5 w-5 text-gray-400" />
                            <select
                                value={filterGenre}
                                onChange={(e) => setFilterGenre(e.target.value)}
                                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white"
                            >
                                <option value="all">All Genres</option>
                                {genres.map(genre => (
                                    <option key={genre} value={genre}>{genre}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Pending Artists List */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Users className="h-5 w-5 text-purple-600" />
                            Pending Artist Applications ({filteredArtists.length})
                        </h2>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto"></div>
                            <p className="mt-4 text-gray-500">Loading pending artists...</p>
                        </div>
                    ) : filteredArtists.length === 0 ? (
                        <div className="p-12 text-center">
                            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No pending artist applications</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {filteredArtists.map((artist) => (
                                <div key={artist.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0">
                                            {artist.avatar_url ? (
                                                <img
                                                    src={artist.avatar_url}
                                                    alt={artist.full_name}
                                                    className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
                                                />
                                            ) : (
                                                <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center">
                                                    <span className="text-xl font-bold text-purple-600">
                                                        {artist.full_name?.[0]?.toUpperCase() || '?'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                    {artist.full_name || 'Unnamed Artist'}
                                                </h3>
                                                {artist.genre && (
                                                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                                                        {artist.genre}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                                <span className="flex items-center gap-1">
                                                    <Mail className="h-4 w-4" />
                                                    {artist.email}
                                                </span>
                                                <span>
                                                    Applied {new Date(artist.created_at).toLocaleDateString()}
                                                </span>
                                            </div>

                                            {artist.artist_bio && (
                                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                                    {artist.artist_bio}
                                                </p>
                                            )}

                                            {artist.artist_portfolio_url && (
                                                <a
                                                    href={artist.artist_portfolio_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-700 text-sm font-medium"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                    View Portfolio
                                                </a>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleApprove(artist.id, artist.full_name)}
                                                disabled={actionLoading === artist.id}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {actionLoading === artist.id ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                ) : (
                                                    <CheckCircle className="h-4 w-4" />
                                                )}
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleReject(artist.id, artist.full_name)}
                                                disabled={actionLoading === artist.id}
                                                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                            >
                                                <XCircle className="h-4 w-4" />
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
