import { Head, router } from '@inertiajs/react';
import {
    BriefcaseBusiness,
    IndianRupee,
    PackagePlus,
    ReceiptText,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDate, formatShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';

type Row = {
    date: string;
    sales: number;
    purchases: number;
    expenses: number;
    net: number;
    cumulative: number;
};

type Props = {
    totals: {
        sales: number;
        purchases: number;
        expenses: number;
        salary: number;
        net: number;
    };
    vendorBalance: number;
    rows: Row[];
    filters: { from: string; to: string };
};

// Diverging pair (profit / loss) from the validated reference palette.
const profitFill = 'fill-[#2a78d6] dark:fill-[#3987e5]';
const lossFill = 'fill-[#e34948] dark:fill-[#e66767]';
const profitText = 'text-[#1f63b4] dark:text-[#6aa6ee]';
const lossText = 'text-[#c23534] dark:text-[#ef8a8a]';

export default function Dashboard({
    totals,
    vendorBalance,
    rows,
    filters,
}: Props) {
    const setFilter = (key: 'from' | 'to', value: string) =>
        router.get(
            dashboard.url(),
            { ...filters, [key]: value },
            { preserveState: true, preserveScroll: true, replace: true },
        );

    const cards = [
        {
            label: 'Total received (sales)',
            value: totals.sales,
            icon: IndianRupee,
        },
        {
            label: 'Purchase expenses',
            value: totals.purchases,
            icon: PackagePlus,
        },
        {
            label: 'Immediate expenses',
            value: totals.expenses,
            icon: ReceiptText,
        },
        {
            label: 'Salary expenses',
            value: totals.salary,
            icon: BriefcaseBusiness,
        },
    ];
    const profit = totals.net >= 0;

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">
                            Dashboard
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Scrap accounting overview
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <Input
                            type="date"
                            aria-label="From date"
                            value={filters.from}
                            max={filters.to}
                            onChange={(e) => setFilter('from', e.target.value)}
                        />
                        <Input
                            type="date"
                            aria-label="To date"
                            value={filters.to}
                            min={filters.from}
                            onChange={(e) => setFilter('to', e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    {cards.map((card) => (
                        <div
                            key={card.label}
                            className="flex items-center justify-between rounded-xl border p-4"
                        >
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    {card.label}
                                </p>
                                <p className="mt-1 text-2xl font-semibold tabular-nums">
                                    {formatShort(card.value)}
                                </p>
                            </div>
                            <div className="grid size-11 place-items-center rounded-lg bg-muted">
                                <card.icon className="size-5" />
                            </div>
                        </div>
                    ))}
                    <div className="flex items-center justify-between rounded-xl border p-4">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Net profit
                            </p>
                            <p
                                className={cn(
                                    'mt-1 text-2xl font-semibold tabular-nums',
                                    profit ? profitText : lossText,
                                )}
                            >
                                {formatShort(totals.net)}
                            </p>
                        </div>
                        <div className="grid size-11 place-items-center rounded-lg bg-muted">
                            {profit ? (
                                <TrendingUp className="size-5" />
                            ) : (
                                <TrendingDown className="size-5" />
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <div className="rounded-xl border p-4">
                        <h2 className="font-medium">Profit &amp; loss</h2>
                        <dl className="mt-2 divide-y text-sm">
                            {[
                                ['Sales received', totals.sales],
                                ['Purchases', -totals.purchases],
                                ['Immediate expenses', -totals.expenses],
                                ['Salary', -totals.salary],
                            ].map(([label, value]) => (
                                <div
                                    key={label}
                                    className="flex justify-between py-2"
                                >
                                    <dt>{label}</dt>
                                    <dd className="tabular-nums">
                                        {formatCurrency(value)}
                                    </dd>
                                </div>
                            ))}
                            <div className="flex justify-between py-2 font-semibold">
                                <dt>Net profit</dt>
                                <dd
                                    className={cn(
                                        'tabular-nums',
                                        profit ? profitText : lossText,
                                    )}
                                >
                                    {formatCurrency(totals.net)}
                                </dd>
                            </div>
                            <div className="flex justify-between py-2 font-semibold">
                                <dt>Vendor balance to pay</dt>
                                <dd className="tabular-nums">
                                    {formatCurrency(vendorBalance)}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    <ProfitChart rows={rows} />
                </div>

                <div className="overflow-x-auto rounded-xl border">
                    <h2 className="px-4 pt-4 font-medium">Date-wise report</h2>
                    {rows.length === 0 ? (
                        <p className="p-8 text-center text-sm text-muted-foreground">
                            No data in this date range.
                        </p>
                    ) : (
                        <table className="mt-2 w-full text-sm">
                            <thead className="text-muted-foreground">
                                <tr className="border-b">
                                    <th className="px-4 py-2 text-left font-medium">
                                        Date
                                    </th>
                                    <th className="px-4 py-2 text-right font-medium">
                                        Sales
                                    </th>
                                    <th className="px-4 py-2 text-right font-medium">
                                        Purchases
                                    </th>
                                    <th className="px-4 py-2 text-right font-medium">
                                        Expenses + salary
                                    </th>
                                    <th className="px-4 py-2 text-right font-medium">
                                        Net
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {[...rows].reverse().map((row) => (
                                    <tr key={row.date}>
                                        <td className="px-4 py-2">
                                            {formatDate(row.date)}
                                        </td>
                                        <td className="px-4 py-2 text-right tabular-nums">
                                            {formatShort(row.sales)}
                                        </td>
                                        <td className="px-4 py-2 text-right tabular-nums">
                                            {formatShort(row.purchases)}
                                        </td>
                                        <td className="px-4 py-2 text-right tabular-nums">
                                            {formatShort(row.expenses)}
                                        </td>
                                        <td
                                            className={cn(
                                                'px-4 py-2 text-right font-medium tabular-nums',
                                                row.net >= 0
                                                    ? profitText
                                                    : lossText,
                                            )}
                                        >
                                            {formatShort(row.net)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </>
    );
}

/**
 * Daily net profit as bars (blue profit, red loss) with the running total as a line.
 */
function ProfitChart({ rows }: { rows: Row[] }) {
    const [hover, setHover] = useState<number | null>(null);
    const W = 640;
    const H = 240;
    const pad = { l: 8, r: 8, t: 12, b: 24 };

    const values = rows.flatMap((r) => [r.net, r.cumulative]).concat(0);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    const y = (v: number) => pad.t + ((max - v) / range) * (H - pad.t - pad.b);
    const band = (W - pad.l - pad.r) / Math.max(rows.length, 1);
    const x = (i: number) => pad.l + band * i + band / 2;
    const barWidth = Math.max(2, Math.min(24, band - 2));
    const labelEvery = Math.ceil(rows.length / 7);
    const active = hover !== null ? rows[hover] : null;

    return (
        <div className="rounded-xl border p-4 lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-medium">Net profit, date-wise</h2>
                <div className="flex gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <svg className="size-2.5" aria-hidden>
                            <rect
                                width="10"
                                height="10"
                                rx="2"
                                className={profitFill}
                            />
                        </svg>
                        Profit day
                    </span>
                    <span className="flex items-center gap-1.5">
                        <svg className="size-2.5" aria-hidden>
                            <rect
                                width="10"
                                height="10"
                                rx="2"
                                className={lossFill}
                            />
                        </svg>
                        Loss day
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="h-0.5 w-4 rounded bg-foreground" />
                        Running total
                    </span>
                </div>
            </div>

            {rows.length === 0 ? (
                <p className="py-16 text-center text-sm text-muted-foreground">
                    No data in this date range.
                </p>
            ) : (
                <div className="relative mt-3">
                    <svg
                        viewBox={`0 0 ${W} ${H}`}
                        className="w-full"
                        role="img"
                        aria-label="Daily net profit and running total"
                        onMouseLeave={() => setHover(null)}
                    >
                        <line
                            x1={pad.l}
                            x2={W - pad.r}
                            y1={y(0)}
                            y2={y(0)}
                            className="stroke-border"
                        />
                        {rows.map((row, i) => (
                            <g key={row.date}>
                                {hover === i && (
                                    <rect
                                        x={x(i) - band / 2}
                                        y={pad.t}
                                        width={band}
                                        height={H - pad.t - pad.b}
                                        className="fill-muted"
                                    />
                                )}
                                <rect
                                    x={x(i) - barWidth / 2}
                                    y={Math.min(y(row.net), y(0))}
                                    width={barWidth}
                                    height={Math.max(
                                        1,
                                        Math.abs(y(row.net) - y(0)),
                                    )}
                                    rx={Math.min(4, barWidth / 3)}
                                    className={
                                        row.net >= 0 ? profitFill : lossFill
                                    }
                                />
                                {i % labelEvery === 0 && (
                                    <text
                                        x={x(i)}
                                        y={H - 6}
                                        textAnchor="middle"
                                        className="fill-muted-foreground text-[11px]"
                                    >
                                        {formatDate(row.date).slice(0, 5)}
                                    </text>
                                )}
                                <rect
                                    x={x(i) - band / 2}
                                    y={0}
                                    width={band}
                                    height={H}
                                    fill="transparent"
                                    onMouseEnter={() => setHover(i)}
                                />
                            </g>
                        ))}
                        <polyline
                            fill="none"
                            strokeWidth={2}
                            strokeLinejoin="round"
                            className="pointer-events-none stroke-foreground"
                            points={rows
                                .map((r, i) => `${x(i)},${y(r.cumulative)}`)
                                .join(' ')}
                        />
                        {active && hover !== null && (
                            <circle
                                cx={x(hover)}
                                cy={y(active.cumulative)}
                                r={4}
                                className="pointer-events-none fill-foreground stroke-background"
                                strokeWidth={2}
                            />
                        )}
                    </svg>

                    {active && hover !== null && (
                        <div
                            className="pointer-events-none absolute top-0 z-10 w-max rounded-md border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md"
                            style={
                                hover > rows.length / 2
                                    ? {
                                          right: `${100 - (x(hover) / W) * 100 + 2}%`,
                                      }
                                    : { left: `${(x(hover) / W) * 100 + 2}%` }
                            }
                        >
                            <p className="font-medium">
                                {formatDate(active.date)}
                            </p>
                            <p className="mt-1 flex justify-between gap-4">
                                Net{' '}
                                <span className="tabular-nums">
                                    {formatCurrency(active.net)}
                                </span>
                            </p>
                            <p className="flex justify-between gap-4">
                                Running total{' '}
                                <span className="tabular-nums">
                                    {formatCurrency(active.cumulative)}
                                </span>
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: dashboard() }],
};
