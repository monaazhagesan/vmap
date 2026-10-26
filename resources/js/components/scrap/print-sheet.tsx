import type { ReactNode } from 'react';
import type { CompanyDetails } from '@/types/vmap';

/**
 * A white paper sheet with the company letterhead, used for bills and reports.
 * Always light, even in dark mode, so it looks the same on screen and on paper.
 */
export default function PrintSheet({
    company,
    children,
}: {
    company: Partial<CompanyDetails> | null;
    children: ReactNode;
}) {
    return (
        <div className="mx-auto w-full max-w-3xl overflow-x-auto rounded-lg border bg-white p-6 text-neutral-900 shadow-sm print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none">
            <div className="mb-4 border-b-2 border-neutral-800 pb-3 text-center">
                <h2 className="text-lg font-bold">
                    {company?.name || 'Company name'}
                </h2>
                {company?.registration_number && (
                    <p className="text-sm">
                        Reg. No: {company.registration_number}
                    </p>
                )}
                {company?.address && (
                    <p className="text-sm whitespace-pre-line">
                        {company.address}
                    </p>
                )}
                {company?.phone && (
                    <p className="text-sm">Ph: {company.phone}</p>
                )}
            </div>
            {children}
        </div>
    );
}
