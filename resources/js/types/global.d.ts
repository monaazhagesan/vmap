import type { Auth } from '@/types/auth';
import type { CompanyStatus } from '@/types/vmap';

declare module 'react' {
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            company: CompanyStatus | null;
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}
