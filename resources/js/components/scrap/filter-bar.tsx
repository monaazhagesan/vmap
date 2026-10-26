import { router } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * A GET filter form that reloads the current page with its fields as query params.
 */
export default function FilterBar({
    url,
    search,
    placeholder = 'Search…',
    hasFilters,
    searchable = true,
    children,
}: {
    url: string;
    search: string | null;
    placeholder?: string;
    hasFilters: boolean;
    searchable?: boolean;
    children?: ReactNode;
}) {
    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const query = Object.fromEntries(
            [...new FormData(event.currentTarget).entries()].filter(
                ([, value]) => value !== '',
            ),
        );

        router.get(url, query, { preserveState: true, replace: true });
    };

    return (
        <form
            onSubmit={submit}
            onChange={(event) => {
                if ((event.target as HTMLElement).tagName === 'SELECT') {
                    event.currentTarget.requestSubmit();
                }
            }}
            className="flex flex-col gap-2 sm:flex-row sm:items-center"
        >
            {searchable && (
                <div className="relative sm:w-72">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        name="search"
                        defaultValue={search ?? ''}
                        placeholder={placeholder}
                        className="pl-9"
                    />
                </div>
            )}
            {children}
            <Button type="submit" variant="secondary">
                Filter
            </Button>
            {hasFilters && (
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.get(url, {}, { replace: true })}
                >
                    <X /> Clear
                </Button>
            )}
        </form>
    );
}
