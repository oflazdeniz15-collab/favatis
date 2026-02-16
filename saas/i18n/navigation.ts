import { createNavigation } from 'next-intl/navigation';

export const locales = ['en', 'tr'] as const;
export const localePrefix = 'always'; // Default

export const { Link, redirect, usePathname, useRouter, getPathname } =
    createNavigation({ locales, localePrefix });
