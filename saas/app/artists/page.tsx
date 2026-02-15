'use client';

import { Music2, Search, Filter, ArrowRight, User } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header';

const sampleArtists = [
    { id: 1, name: 'Luna Rivers', genre: 'Dream Pop', fans: '12.4K', image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80&w=400' },
    { id: 2, name: 'The Midnight City', genre: 'Synthwave', fans: '8.2K', image: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=400' },
    { id: 3, name: 'Acoustic Soul', genre: 'Folk / R&B', fans: '5.1K', image: 'https://images.unsplash.com/photo-1459749411177-042180ceea72?auto=format&fit=crop&q=80&w=400' },
    { id: 4, name: 'Echo Pulse', genre: 'Experimental', fans: '3.9K', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=400' },
];

export default function ArtistsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="pt-32 pb-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">Discover Artists</h1>
                            <p className="text-gray-600">Support your favorites and find new sounds from around the world.</p>
                        </div>

                        <div className="flex bg-white rounded-2xl shadow-sm border border-gray-200 p-1 w-full max-w-md">
                            <div className="flex items-center px-4">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name or genre..."
                                className="flex-1 bg-transparent py-3 outline-none text-gray-900"
                            />
                            <button className="bg-purple-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-purple-700 transition-colors">
                                <Filter className="h-5 w-5 md:hidden" />
                                <span className="hidden md:block">Filter</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {sampleArtists.map((artist) => (
                            <div key={artist.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all group">
                                <div className="relative aspect-square overflow-hidden">
                                    <img
                                        src={artist.image}
                                        alt={artist.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xl font-bold text-gray-900">{artist.name}</h3>
                                        <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full uppercase">
                                            {artist.genre}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                                        <User className="h-4 w-4" />
                                        {artist.fans} active subscribers
                                    </div>
                                    <button className="w-full py-3 bg-gray-50 text-gray-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-purple-600 hover:text-white transition-all group/btn">
                                        View Profile
                                        <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
