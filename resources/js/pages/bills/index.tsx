import { Head, Link } from '@inertiajs/react';
import { FileText, Pencil, Plus } from 'lucide-react';
import BillController from '@/actions/App/Http/Controllers/BillController';
import DeleteButton from '@/components/scrap/delete-button';
import FilterBar from '@/components/scrap/filter-bar';
import PageHeader from '@/components/scrap/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDate, formatNumber } from '@/lib/format';
import { create, index as billsIndex, show } from '@/routes/bills';
import type { Bill, BillType } from '@/types/vmap';

type Props = {
    type: BillType;
    groups: { party: string; count: number; total: number; bills: Bill[] }[];
    totals: { count: number; weight: number; amount: number };
    filters: { search: string | null; from: string | null; to: string | null };
};

export default function BillsIndex({ type, groups, totals, filters }: Props) {
    const title = type === 'sales' ? 'Sales orders' : 'Purchase orders';
    const party = type === 'sales' ? 'customer' : 'vendor';

    return (
        <>
            <Head title={title} />

            <div className="flex flex-col gap-4 p-4">
                <PageHeader
                    title={title}
                    description={`${totals.count} bills · ${formatNumber(totals.weight)} kg · ${formatCurrency(totals.amount)}`}
                    actions={
                        <Button asChild>
                            <Link href={create({ query: { type } })}>
                                <Plus /> New
                            </Link>
                        </Button>
                    }
                />

                <FilterBar
                    url={billsIndex.url(type)}
                    search={filters.search}
                    placeholder={`Search ${party}, vehicle or bill no…`}
                    hasFilters={
                        !!(filters.search || filters.from || filters.to)
                    }
                >
                    <Input
                        type="date"
                        name="from"
                        aria-label="From date"
                        defaultValue={filters.from ?? ''}
                        className="sm:w-40"
                    />
                    <Input
                        type="date"
                        name="to"
                        aria-label="To date"
                        defaultValue={filters.to ?? ''}
                        className="sm:w-40"
                    />
                </FilterBar>

                {groups.length === 0 && (
                    <div className="rounded-xl border p-10 text-center text-sm text-muted-foreground">
                        No bills yet. Tap “New” to add a weighment.
                    </div>
                )}

                <div className="grid gap-4 xl:grid-cols-2">
                    {groups.map((group) => (
                        <div key={group.party} className="rounded-xl border">
                            <div className="flex items-center justify-between gap-3 border-b p-4">
                                <div className="min-w-0">
                                    <p className="truncate font-semibold">
                                        {group.party}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {group.count}{' '}
                                        {group.count > 1 ? 'entries' : 'entry'}{' '}
                                        · {formatCurrency(group.total)}
                                    </p>
                                </div>
                                <Button size="sm" variant="secondary" asChild>
                                    <Link
                                        href={create({
                                            query: { type, party: group.party },
                                        })}
                                    >
                                        <Plus /> Add
                                    </Link>
                                </Button>
                            </div>
                            <ul className="divide-y">
                                {group.bills.map((bill) => (
                                    <li
                                        key={bill.id}
                                        className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 px-4 py-3 text-sm"
                                    >
                                        <div className="min-w-0">
                                            <p>
                                                <span className="font-medium">
                                                    {bill.vehicle_number}
                                                </span>{' '}
                                                <span className="text-xs text-muted-foreground">
                                                    {bill.bill_no}
                                                </span>
                                            </p>
                                            <p className="text-muted-foreground">
                                                {bill.material} ·{' '}
                                                {formatDate(bill.date)}
                                            </p>
                                            <p className="text-muted-foreground tabular-nums">
                                                {Number(bill.vehicle_weight) >
                                                    0 &&
                                                    `${formatNumber(bill.gross_weight)} − ${formatNumber(bill.vehicle_weight)} = `}
                                                {formatNumber(bill.net_weight)}{' '}
                                                kg @ {formatCurrency(bill.rate)}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="font-semibold tabular-nums">
                                                {formatCurrency(bill.amount)}
                                            </span>
                                            <div className="flex">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label="Print or save PDF"
                                                    asChild
                                                >
                                                    <Link href={show(bill.id)}>
                                                        <FileText />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label="Edit"
                                                    asChild
                                                >
                                                    <Link
                                                        href={BillController.edit(
                                                            bill.id,
                                                        )}
                                                    >
                                                        <Pencil />
                                                    </Link>
                                                </Button>
                                                <DeleteButton
                                                    action={BillController.destroy.form(
                                                        bill.id,
                                                    )}
                                                    title={`Delete bill ${bill.bill_no}?`}
                                                    description="This order will be removed permanently."
                                                />
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

BillsIndex.layout = (props: Props) => ({
    breadcrumbs: [
        {
            title: props.type === 'sales' ? 'Sales orders' : 'Purchase orders',
            href: billsIndex(props.type),
        },
    ],
});
