import { ReactNode } from 'react';

interface ProvidersProps {
    children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <>
            {/* Add providers here: Auth, Theme, etc. */}
            {children}
        </>
    );
}
