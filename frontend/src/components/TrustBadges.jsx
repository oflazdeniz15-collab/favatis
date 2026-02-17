import React from 'react';
import { Shield, Lock, Award, Users, CreditCard, Globe } from 'lucide-react';

// Trust indicators that build instant credibility
export default function TrustBadges({ variant = 'horizontal' }) {
    const badges = [
        {
            icon: Shield,
            label: '256-bit SSL',
            description: 'Bank-level security',
            color: 'green'
        },
        {
            icon: Lock,
            label: 'GDPR Compliant',
            description: 'Privacy protected',
            color: 'blue'
        },
        {
            icon: CreditCard,
            label: 'Secure Payments',
            description: 'Powered by Stripe',
            color: 'purple'
        },
        {
            icon: Users,
            label: '50K+ Artists',
            description: 'Trusted platform',
            color: 'pink'
        },
        {
            icon: Globe,
            label: '190+ Countries',
            description: 'Global reach',
            color: 'indigo'
        },
        {
            icon: Award,
            label: '99.9% Uptime',
            description: 'Reliable service',
            color: 'amber'
        }
    ];

    const colorClasses = {
        green: 'bg-green-100 text-green-600',
        blue: 'bg-blue-100 text-blue-600',
        purple: 'bg-purple-100 text-purple-600',
        pink: 'bg-pink-100 text-pink-600',
        indigo: 'bg-indigo-100 text-indigo-600',
        amber: 'bg-amber-100 text-amber-600'
    };

    if (variant === 'compact') {
        return (
            <div className="flex flex-wrap items-center justify-center gap-4 py-4">
                {badges.slice(0, 4).map((badge, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-gray-600">
                        <badge.icon className={`w-4 h-4 ${colorClasses[badge.color].split(' ')[1]}`} />
                        <span className="text-sm font-medium">{badge.label}</span>
                    </div>
                ))}
            </div>
        );
    }

    if (variant === 'minimal') {
        return (
            <div className="flex items-center gap-3 text-gray-500 text-sm">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Secure & Encrypted</span>
                <span className="text-gray-300">|</span>
                <Lock className="w-4 h-4 text-blue-500" />
                <span>Privacy Protected</span>
            </div>
        );
    }

    // Default horizontal layout
    return (
        <div className="w-full overflow-x-auto py-6">
            <div className="flex items-center justify-center gap-6 min-w-max px-4">
                {badges.map((badge, idx) => (
                    <div
                        key={idx}
                        className="flex items-center gap-3 px-5 py-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300 group"
                    >
                        <div className={`w-10 h-10 rounded-full ${colorClasses[badge.color]} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <badge.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800 text-sm">{badge.label}</p>
                            <p className="text-xs text-gray-500">{badge.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Stats Section for social proof
export function StatsSection() {
    const stats = [
        { value: '50K+', label: 'Active Artists', icon: Users },
        { value: '2M+', label: 'Happy Fans', icon: Award },
        { value: '$10M+', label: 'Paid to Artists', icon: CreditCard },
        { value: '190+', label: 'Countries', icon: Globe }
    ];

    return (
        <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 py-16">
            <div className="max-w-6xl mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="text-center group">
                            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300">
                                <stat.icon className="w-7 h-7 text-white" />
                            </div>
                            <p className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</p>
                            <p className="text-purple-200 text-sm">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
