'use client';

import { Check, Music2, Shield, Zap, Star } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import Header from '@/components/Header';

const tiers = [
    {
        name: 'Free',
        price: '0',
        description: 'Perfect for getting started and supporting your favorite artists.',
        features: [
            'Basic artist access',
            'Public posts',
            'Limited track previews',
            'Community access',
        ],
        cta: 'Get Started',
        href: '/auth/signin',
        popular: false,
        icon: Music2,
    },
    {
        name: 'Pro',
        price: '19',
        description: 'Best for dedicated fans who want exclusive content and early access.',
        features: [
            'All Free features',
            'Exclusive track releases',
            'Behind-the-scenes content',
            'Early ticket access',
            'High-quality audio',
        ],
        cta: 'Subscribe Pro',
        href: '/auth/signin?tier=pro',
        popular: true,
        icon: Zap,
    },
    {
        name: 'Elite',
        price: '49',
        description: 'For the ultimate supporters. Direct connection and limited physical perks.',
        features: [
            'All Pro features',
            'Direct artist messaging',
            'Limited edition merch access',
            'Virtual meet & greets',
            'Name in credits',
        ],
        cta: 'Go Elite',
        href: '/auth/signin?tier=elite',
        popular: false,
        icon: Star,
    },
];

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="pt-32 pb-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                            Support Your <span className="text-purple-600">Passion</span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Choose the plan that fits your level of support. 100% of platform fees go directly to artists.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {tiers.map((tier) => (
                            <div
                                key={tier.name}
                                className={`relative bg-white rounded-3xl p-8 shadow-xl border-2 transition-all hover:-translate-y-2 ${tier.popular ? 'border-purple-600 scale-105 z-10' : 'border-transparent'
                                    }`}
                            >
                                {tier.popular && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
                                        Most Popular
                                    </div>
                                )}

                                <div className="flex items-center gap-3 mb-6">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tier.name === 'Pro' ? 'bg-purple-100 text-purple-600' :
                                        tier.name === 'Elite' ? 'bg-amber-100 text-amber-600' : 'bg-zinc-100 text-zinc-600'
                                        }`}>
                                        <tier.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900">{tier.name}</h3>
                                </div>

                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className="text-5xl font-extrabold text-gray-900">${tier.price}</span>
                                    <span className="text-gray-500 font-medium">/month</span>
                                </div>

                                <p className="text-gray-600 mb-8 leading-relaxed">
                                    {tier.description}
                                </p>

                                <ul className="space-y-4 mb-10">
                                    {tier.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-3 text-gray-700">
                                            <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
                                                <Check className="h-3 w-3" />
                                            </div>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    href={tier.href}
                                    className={`w-full py-4 rounded-xl font-bold text-center transition-all ${tier.popular
                                        ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-200'
                                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                        }`}
                                >
                                    {tier.cta}
                                </Link>
                            </div>
                        ))}
                    </div>

                    {/* Trust Indicators */}
                    <div className="mt-20 py-12 border-t border-gray-200 flex flex-wrap justify-center gap-12 grayscale opacity-60">
                        <div className="flex items-center gap-2 font-bold text-2xl">
                            <Shield className="h-8 w-8 text-purple-600" />
                            Safe & Secure
                        </div>
                        <div className="flex items-center gap-2 font-bold text-2xl">
                            <Music2 className="h-8 w-8 text-purple-600" />
                            Premium Audio
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
