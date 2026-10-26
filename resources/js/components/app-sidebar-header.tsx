import { Link, usePage } from '@inertiajs/react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { show as subscription } from '@/routes/subscription';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { auth, company } = usePage().props;
    const isOwner = auth.user.role === 'owner';

    return (
        <div className="print:hidden">
            <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
                <div className="flex min-w-0 items-center gap-2">
                    <SidebarTrigger className="-ml-1" />
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
                {company && (
                    <div className="truncate text-right text-xs text-muted-foreground">
                        {company.name}
                        <span className="hidden sm:inline">
                            {' '}
                            · {isOwner ? 'Owner' : 'Admin'}
                        </span>
                    </div>
                )}
            </header>
            {isOwner && company?.endsSoon && company.expiresAt && (
                <div className="bg-amber-100 px-4 py-2 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                    ⚠ Your plan ends on{' '}
                    {new Date(company.expiresAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                    .{' '}
                    <Link
                        href={subscription()}
                        className="font-medium underline underline-offset-4"
                    >
                        Renew
                    </Link>
                </div>
            )}
        </div>
    );
}
