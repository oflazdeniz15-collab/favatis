'use client';

import { ReactNode } from 'react';

interface ProvidersProps {
    children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    // Using Supabase Auth - no session provider needed
    // The auth state is managed client-side via Supabase client
    return <>{children}</>;
}
