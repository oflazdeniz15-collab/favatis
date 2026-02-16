import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export default getRequestConfig(async ({ locale }) => {
    // Validate that the incoming `locale` parameter is valid
    if (!['en', 'tr'].includes(locale as string)) notFound();

    console.log(`[i18n] Loading messages for locale: ${locale}`);

    try {
        const messages = (await import(`./messages/${locale}.json`)).default;
        console.log(`[i18n] Successfully loaded messages for locale: ${locale}`);
        return {
            locale: locale as string,
            messages
        };
    } catch (error) {
        console.error(`Failed to load messages for locale: ${locale}`, error);
        notFound();
    }
});
