import { Head, Link } from '@inertiajs/react';
import { PackageMinus, PackagePlus, ReceiptText, Wallet } from 'lucide-react';
import { index, show } from '@/routes/reports';

type Props = {
    reports: Record<string, { title: string; description: string }>;
};

const icons = {
    purchase: PackagePlus,
    sales: PackageMinus,
    expense: Wallet,
    immediate: ReceiptText,
} as const;

export default function ReportsIndex({ reports }: Props) {
    return (
        <>
            <Head title="Reports" />

            <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">
                        Reports
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Choose dates, group by day, week, month or year, and
                        save as PDF.
                    </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    {Object.entries(reports).map(([key, report]) => {
                        const Icon = icons[key as keyof typeof icons];

                        return (
                            <Link
                                key={key}
                                href={show(key)}
                                className="flex items-center justify-between gap-3 rounded-xl border p-4 transition-colors hover:bg-accent"
                            >
                                <div>
                                    <p className="font-semibold">
                                        {report.title}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {report.description}
                                    </p>
                                </div>
                                <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-muted">
                                    <Icon className="size-5" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </>
    );
}

ReportsIndex.layout = {
    breadcrumbs: [{ title: 'Reports', href: index() }],
};
