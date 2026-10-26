import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import type { Paginated } from '@/types/vmap';

export default function Pagination<T>({ page }: { page: Paginated<T> }) {
    if (page.total === 0) {
        return null;
    }

    return (
        <div className="flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
            <p>
                Showing {page.from}–{page.to} of {page.total}
            </p>

            {page.last_page > 1 && (
                <nav className="flex flex-wrap gap-1">
                    {page.links.map((link, index) =>
                        link.url ? (
                            <Link
                                key={index}
                                href={link.url}
                                preserveScroll
                                preserveState
                                className={cn(
                                    'rounded-md border px-3 py-1.5 transition-colors hover:bg-accent',
                                    link.active &&
                                        'border-primary bg-primary text-primary-foreground hover:bg-primary',
                                )}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ) : (
                            <span
                                key={index}
                                className="rounded-md border px-3 py-1.5 opacity-50"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ),
                    )}
                </nav>
            )}
        </div>
    );
}
