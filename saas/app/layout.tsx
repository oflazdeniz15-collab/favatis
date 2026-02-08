import './globals.css';
import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import { Providers } from './providers';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

const outfit = Outfit({
    subsets: ['latin'],
    variable: '--font-outfit',
    display: 'swap',
});

export const metadata: Metadata = {
    title: {
        default: 'Favatis | Connect with Your Favorite Artists',
        template: '%s | Favatis',
    },
    description: 'Support musicians directly through exclusive subscriptions. Get access to behind-the-scenes content, early releases, and connect with artists like never before.',
    keywords: ['music', 'artists', 'subscriptions', 'exclusive content', 'support artists', 'fan platform'],
    authors: [{ name: 'Favatis' }],
    creator: 'Favatis',
    publisher: 'Favatis',
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://favatis.vercel.app'),
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: '/',
        siteName: 'Favatis',
        title: 'Favatis | Connect with Your Favorite Artists',
        description: 'Support musicians directly through exclusive subscriptions.',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Favatis - Artist Support Platform',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Favatis | Connect with Your Favorite Artists',
        description: 'Support musicians directly through exclusive subscriptions.',
        images: ['/og-image.png'],
        creator: '@favatis',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
            <body className="font-sans antialiased">
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
