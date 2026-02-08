'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Copy, Check, Wand2 } from 'lucide-react';

type ContentType = 'bio' | 'portfolio' | 'social';

interface GenerationResult {
    success: boolean;
    content?: string;
    error?: string;
}

export default function AIBioGenerator() {
    const [contentType, setContentType] = useState<ContentType>('bio');
    const [artistName, setArtistName] = useState('');
    const [genre, setGenre] = useState('');
    const [influences, setInfluences] = useState('');
    const [achievements, setAchievements] = useState('');
    const [prompt, setPrompt] = useState('');
    const [platform, setPlatform] = useState<'twitter' | 'instagram' | 'tiktok'>('instagram');
    const [generatedContent, setGeneratedContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        if (!prompt) {
            setError('Please provide a description or prompt');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedContent('');

        try {
            const response = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: contentType,
                    prompt,
                    artistName: artistName || undefined,
                    genre: genre || undefined,
                    influences: influences ? influences.split(',').map(i => i.trim()) : undefined,
                    achievements: achievements ? achievements.split(',').map(a => a.trim()) : undefined,
                    platform: contentType === 'social' ? platform : undefined,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate content');
            }

            const data: GenerationResult = await response.json();

            if (data.success && data.content) {
                setGeneratedContent(data.content);
            } else {
                throw new Error(data.error || 'Failed to generate content');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = async () => {
        if (generatedContent) {
            await navigator.clipboard.writeText(generatedContent);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const typeLabels: Record<ContentType, string> = {
        bio: 'Artist Biography',
        portfolio: 'Portfolio Description',
        social: 'Social Media Post',
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">AI Content Generator</h2>
                        <p className="text-purple-100 text-sm">Powered by Gemini AI</p>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Content Type Selector */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content Type
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {(['bio', 'portfolio', 'social'] as ContentType[]).map((type) => (
                            <button
                                key={type}
                                onClick={() => setContentType(type)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${contentType === type
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {typeLabels[type]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Artist Name
                        </label>
                        <input
                            type="text"
                            value={artistName}
                            onChange={(e) => setArtistName(e.target.value)}
                            placeholder="e.g., Luna Rivers"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Genre
                        </label>
                        <input
                            type="text"
                            value={genre}
                            onChange={(e) => setGenre(e.target.value)}
                            placeholder="e.g., Indie Pop, R&B, Electronic"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Influences (comma separated)
                        </label>
                        <input
                            type="text"
                            value={influences}
                            onChange={(e) => setInfluences(e.target.value)}
                            placeholder="e.g., Billie Eilish, Lorde, Frank Ocean"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Achievements (comma separated)
                        </label>
                        <input
                            type="text"
                            value={achievements}
                            onChange={(e) => setAchievements(e.target.value)}
                            placeholder="e.g., 1M Spotify streams, SXSW 2024"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        />
                    </div>
                </div>

                {/* Platform for Social Posts */}
                {contentType === 'social' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Target Platform
                        </label>
                        <div className="flex gap-2">
                            {(['instagram', 'twitter', 'tiktok'] as const).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPlatform(p)}
                                    className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${platform === p
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Prompt */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Description / Context *
                    </label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={
                            contentType === 'bio'
                                ? "Describe the artist's journey, style, and what makes them unique..."
                                : contentType === 'portfolio'
                                    ? "Describe the artist's body of work, key projects, and artistic vision..."
                                    : "What's the post about? New single release, tour announcement, fan appreciation..."
                        }
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                    />
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {/* Generate Button */}
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Wand2 className="h-5 w-5" />
                            Generate Content
                        </>
                    )}
                </button>

                {/* Generated Content */}
                {generatedContent && (
                    <div className="mt-6 p-5 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900">Generated {typeLabels[contentType]}</h3>
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                {copied ? (
                                    <>
                                        <Check className="h-4 w-4 text-green-600" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-4 w-4" />
                                        Copy
                                    </>
                                )}
                            </button>
                        </div>
                        <div className="prose prose-sm max-w-none">
                            <p className="text-gray-700 whitespace-pre-wrap">{generatedContent}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
