import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';

/**
 * Total purchased, paid, and the balance still owed.
 */
export default function MoneySummary({
    purchased,
    paid,
}: {
    purchased: number;
    paid: number;
}) {
    const balance = purchased - paid;
    const items = [
        { label: 'Total', value: formatCurrency(purchased) },
        { label: 'Paid', value: formatCurrency(paid) },
        {
            label: balance > 0 ? 'Balance to pay' : 'Balance',
            value: formatCurrency(balance),
            className:
                balance > 0
                    ? 'text-[#c23534] dark:text-[#ef8a8a]'
                    : 'text-muted-foreground',
        },
    ];

    return (
        <div className="grid grid-cols-3 gap-2">
            {items.map((item) => (
                <div key={item.label} className="rounded-xl border p-3">
                    <p className="text-xs text-muted-foreground">
                        {item.label}
                    </p>
                    <p
                        className={cn(
                            'mt-1 font-semibold tabular-nums sm:text-lg',
                            item.className,
                        )}
                    >
                        {item.value}
                    </p>
                </div>
            ))}
        </div>
    );
}
