import Link from 'next/link';
import { Music2, Sparkles, Shield, Users, CreditCard, Globe, Award, ArrowRight } from 'lucide-react';

export default function Home() {
    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="fixed top-0 w-full backdrop-blur-xl bg-white/70 border-b border-gray-100 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center gap-2 text-2xl font-display font-bold text-primary">
                            <Music2 className="h-8 w-8" />
                            Favatis
                        </Link>

                        <div className="hidden md:flex items-center gap-6">
                            <Link href="/artists" className="text-gray-700 hover:text-primary transition-colors font-medium">
                                Artists
                            </Link>
                            <Link href="/pricing" className="text-gray-700 hover:text-primary transition-colors font-medium">
                                Pricing
                            </Link>
                            <Link href="/about" className="text-gray-700 hover:text-primary transition-colors font-medium">
                                About
                            </Link>
                            <Link href="/auth/signin" className="text-gray-700 hover:text-primary transition-colors font-medium">
                                Log In
                            </Link>
                            <Link
                                href="/auth/signin"
                                className="bg-primary text-white px-5 py-2.5 rounded-full font-medium hover:bg-primary-700 transition-all"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 md:pt-40 md:pb-28">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full text-sm font-medium text-primary-700 mb-6">
                            <Sparkles className="h-4 w-4" />
                            AI-Powered Artist Platform
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold font-display text-gray-900 leading-tight mb-6">
                            Connect with Your{' '}
                            <span className="gradient-text">Favorite Artists</span>
                        </h1>

                        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
                            Support musicians directly through exclusive subscriptions. Get access to behind-the-scenes content, early releases, and connect with artists like never before.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/artists"
                                className="btn-primary text-lg px-8 py-4 rounded-full inline-flex items-center gap-2 group"
                            >
                                Explore Artists
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="/auth/signin"
                                className="btn-secondary text-lg px-8 py-4 rounded-full"
                            >
                                Become an Artist
                            </Link>
                        </div>

                        {/* Trust Indicators */}
                        <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-green-500" />
                                <span>Secure Payments</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-purple-500" />
                                <span>50K+ Artists</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Award className="h-4 w-4 text-amber-500" />
                                <span>100% to Artists</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-gradient-to-br from-primary-900 via-primary-800 to-accent">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { value: '50K+', label: 'Active Artists', icon: Users },
                            { value: '2M+', label: 'Happy Fans', icon: Award },
                            { value: '$10M+', label: 'Paid to Artists', icon: CreditCard },
                            { value: '190+', label: 'Countries', icon: Globe },
                        ].map((stat, idx) => (
                            <div key={idx} className="text-center">
                                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <stat.icon className="w-7 h-7 text-white" />
                                </div>
                                <p className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</p>
                                <p className="text-purple-200 text-sm">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold font-display text-gray-900 mb-4">
                            Everything Artists Need
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            A complete platform to grow your fanbase, monetize your art, and connect with fans worldwide.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: 'Exclusive Content',
                                description: 'Share behind-the-scenes, unreleased tracks, and exclusive updates with your most dedicated fans.',
                                icon: Music2,
                                color: 'purple',
                            },
                            {
                                title: 'AI-Powered Tools',
                                description: 'Generate compelling bios, portfolio descriptions, and social media content with AI assistance.',
                                icon: Sparkles,
                                color: 'pink',
                            },
                            {
                                title: 'Flexible Subscriptions',
                                description: 'Create multiple tiers with different perks. Let fans choose how they want to support you.',
                                icon: CreditCard,
                                color: 'blue',
                            },
                        ].map((feature, idx) => (
                            <div key={idx} className="card hover:-translate-y-1 transition-all duration-300">
                                <div className={`w-12 h-12 rounded-xl bg-${feature.color}-100 flex items-center justify-center mb-5`}>
                                    <feature.icon className={`h-6 w-6 text-${feature.color}-600`} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 gradient-bg text-white">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold font-display mb-6">
                        Ready to Connect with Your Fans?
                    </h2>
                    <p className="text-xl opacity-90 mb-10">
                        Join thousands of artists building sustainable careers through direct fan support.
                    </p>
                    <Link
                        href="/auth/signin"
                        className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all group"
                    >
                        Start Your Journey
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center gap-2 text-xl font-display font-bold mb-4 md:mb-0">
                            <Music2 className="h-6 w-6" />
                            Favatis
                        </div>
                        <p className="text-gray-400 text-sm">
                            © {new Date().getFullYear()} Favatis. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
