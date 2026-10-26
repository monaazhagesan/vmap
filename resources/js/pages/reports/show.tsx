import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Printer } from 'lucide-react';
import { useState } from 'react';
import NativeSelect from '@/components/scrap/native-select';
import PrintSheet from '@/components/scrap/print-sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDate } from '@/lib/format';
import { index, show } from '@/routes/reports';
import type { CompanyDetails } from '@/types/vmap';

type Props = {
    report: { key: string; title: string; description: string };
    columns: string[];
    rows: string[][];
    totals: string[];
    detailColumns: string[];
    details: string[][];
    filters: { from: string; to: string; group: string };
    company: Partial<CompanyDetails> | null;
    generatedOn: string;
};

const groupLabels: Record<string, string> = {
    day: 'Date',
    week: 'Week',
    month: 'Month',
    year: 'Year',
};

export default function ReportShow({
    report,
    columns,
    rows,
    totals,
    detailColumns,
    details,
    filters,
    company,
    generatedOn,
}: Props) {
    const [withEntries, setWithEntries] = useState(false);
    const invalid = filters.from > filters.to;

    const setFilter = (key: keyof Props['filters'], value: string) =>
        router.get(
            show.url(report.key),
            { ...filters, [key]: value },
            { preserveScroll: true, preserveState: true, replace: true },
        );

    // Report cells may hold "line one\nline two"; the second line is a muted note.
    const cell = (value: string) => {
        const [first, second] = value.split('\n');

        return (
            <>
                {first}
                {second && (
                    <span className="block text-xs text-neutral-500">
                        {second}
                    </span>
                )}
            </>
        );
    };

    return (
        <>
            <Head title={report.title} />

            <div className="flex flex-col gap-4 p-4">
                <div className="mx-auto grid w-full max-w-3xl gap-3 print:hidden">
                    <div className="flex items-center justify-between gap-2">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={index()}>
                                <ArrowLeft /> Reports
                            </Link>
                        </Button>
                        <Button onClick={() => window.print()}>
                            <Printer /> Save as PDF
                        </Button>
                    </div>
                    <h1 className="text-xl font-semibold tracking-tight">
                        {report.title}
                    </h1>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="grid gap-2">
                            <Label htmlFor="from">From date</Label>
                            <Input
                                id="from"
                                type="date"
                                value={filters.from}
                                onChange={(e) =>
                                    setFilter('from', e.target.value)
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="to">To date</Label>
                            <Input
                                id="to"
                                type="date"
                                value={filters.to}
                                onChange={(e) =>
                                    setFilter('to', e.target.value)
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="group">Group by</Label>
                            <NativeSelect
                                id="group"
                                value={filters.group}
                                onChange={(e) =>
                                    setFilter('group', e.target.value)
                                }
                            >
                                <option value="day">Day</option>
                                <option value="week">Week</option>
                                <option value="month">Month</option>
                                <option value="year">Year</option>
                            </NativeSelect>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="show">Show</Label>
                            <NativeSelect
                                id="show"
                                value={withEntries ? '1' : '0'}
                                onChange={(e) =>
                                    setWithEntries(e.target.value === '1')
                                }
                            >
                                <option value="0">Summary only</option>
                                <option value="1">With entries</option>
                            </NativeSelect>
                        </div>
                    </div>
                </div>

                <PrintSheet company={company}>
                    <h3 className="text-center text-lg font-bold">
                        {report.title}
                    </h3>
                    <p className="mb-4 text-center text-sm">
                        {formatDate(filters.from)} to {formatDate(filters.to)} ·
                        by {filters.group}
                    </p>

                    {invalid ? (
                        <p>Choose a valid date range.</p>
                    ) : rows.length === 0 ? (
                        <p>No entries in this date range.</p>
                    ) : (
                        <>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b-2 border-neutral-800">
                                        {[
                                            groupLabels[filters.group],
                                            ...columns,
                                        ].map((c, i) => (
                                            <th
                                                key={c}
                                                className={
                                                    i === 0
                                                        ? 'py-2 text-left'
                                                        : 'py-2 text-right'
                                                }
                                            >
                                                {c}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row) => (
                                        <tr
                                            key={row[0]}
                                            className="border-t border-neutral-300"
                                        >
                                            {row.map((value, i) => (
                                                <td
                                                    key={i}
                                                    className={
                                                        i === 0
                                                            ? 'py-1.5'
                                                            : 'py-1.5 text-right tabular-nums'
                                                    }
                                                >
                                                    {value}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t-2 border-neutral-800 font-bold">
                                        <td className="py-2">Total</td>
                                        {totals.map((value, i) => (
                                            <td
                                                key={i}
                                                className="py-2 text-right tabular-nums"
                                            >
                                                {value}
                                            </td>
                                        ))}
                                    </tr>
                                </tfoot>
                            </table>

                            {withEntries && (
                                <>
                                    <h4 className="mt-6 mb-2 font-bold">
                                        Entries
                                    </h4>
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b-2 border-neutral-800">
                                                {detailColumns.map((c, i) => (
                                                    <th
                                                        key={c}
                                                        className={
                                                            i ===
                                                            detailColumns.length -
                                                                1
                                                                ? 'py-2 text-right'
                                                                : 'py-2 pr-3 text-left'
                                                        }
                                                    >
                                                        {c}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {details.map((row, r) => (
                                                <tr
                                                    key={r}
                                                    className="border-t border-neutral-300 align-top"
                                                >
                                                    {row.map((value, i) => (
                                                        <td
                                                            key={i}
                                                            className={
                                                                i ===
                                                                row.length - 1
                                                                    ? 'py-1.5 text-right tabular-nums'
                                                                    : 'py-1.5 pr-3'
                                                            }
                                                        >
                                                            {cell(value)}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </>
                            )}
                        </>
                    )}

                    <p className="mt-4 text-xs text-neutral-500">
                        Generated on {generatedOn}
                    </p>
                </PrintSheet>
            </div>
        </>
    );
}

ReportShow.layout = (props: Props) => ({
    breadcrumbs: [
        { title: 'Reports', href: index() },
        { title: props.report.title, href: show(props.report.key) },
    ],
});
