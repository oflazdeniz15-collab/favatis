import { getMessages } from 'next-intl/server';
import { Providers } from './providers';

export default async function LocaleLayout({
    children,
    params: { locale }
}: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    const messages = await getMessages();

    return (
        <Providers locale={locale} messages={messages}>
            {children}
        </Providers>
    );
}
