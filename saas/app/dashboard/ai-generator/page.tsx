'use client';

import AIBioGenerator from '@/components/AIBioGenerator';
import Link from 'next/link';
import { Music2, ArrowLeft } from 'lucide-react';

export default function AIGeneratorPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center h-16 gap-4">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            Back to Dashboard
                        </Link>
                        <div className="flex-1" />
                        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-purple-600">
                            <Music2 className="h-6 w-6" />
                            Favatis
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                <AIBioGenerator />
            </main>
        </div>
    );
}
