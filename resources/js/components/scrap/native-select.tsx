import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/**
 * A plain <select> styled to match <Input>, so it submits with Inertia <Form>.
 */
export default function NativeSelect({
    className,
    ...props
}: ComponentProps<'select'>) {
    return (
        <select
            className={cn(
                'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive md:text-sm dark:bg-input/30 [&>option]:bg-background',
                className,
            )}
            {...props}
        />
    );
}
