import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { Metadata } from 'next';

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
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://favatis.vercel.app'),
};

export default function RootLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { locale?: string };
}) {
    const locale = params?.locale || 'en';

    return (
        <html lang={locale} className={`${inter.variable} ${outfit.variable}`}>
            <body className="font-sans antialiased">
                {children}
            </body>
        </html>
    );
}
