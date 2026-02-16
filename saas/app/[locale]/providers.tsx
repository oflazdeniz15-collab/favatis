'use client';

import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';

export function Providers({
    children,
    locale,
    messages
}: {
    children: ReactNode;
    locale: string;
    messages: any;
}) {
    return (
        <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
        </NextIntlClientProvider>
    );
}
