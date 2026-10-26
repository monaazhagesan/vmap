import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import MoneySummary from '@/components/scrap/money-summary';
import PageHeader from '@/components/scrap/page-header';
import VendorDialog from '@/components/scrap/vendor-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/format';
import { index, show } from '@/routes/vendors';
import type { Vendor } from '@/types/vmap';

type Props = {
    vendors: Vendor[];
    totals: { purchased: number; paid: number };
};

export default function VendorsIndex({ vendors, totals }: Props) {
    const [creating, setCreating] = useState(false);

    return (
        <>
            <Head title="Vendors" />

            <div className="flex flex-col gap-4 p-4">
                <PageHeader
                    title="Vendors"
                    description="Purchases and payments, date-wise"
                    actions={
                        <Button onClick={() => setCreating(true)}>
                            <Plus /> Create vendor
                        </Button>
                    }
                />

                <MoneySummary purchased={totals.purchased} paid={totals.paid} />

                <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 font-medium">
                                    Vendor
                                </th>
                                <th className="px-4 py-3 font-medium">Phone</th>
                                <th className="px-4 py-3 text-right font-medium">
                                    Balance
                                </th>
                                <th className="px-4 py-3 font-medium">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {vendors.map((vendor) => (
                                <tr
                                    key={vendor.id}
                                    className="hover:bg-muted/30"
                                >
                                    <td className="px-4 py-3">
                                        <Link
                                            href={show(vendor.id)}
                                            className="font-medium underline-offset-4 hover:underline"
                                        >
                                            {vendor.name}
                                        </Link>
                                        {vendor.contact_person && (
                                            <span className="block text-xs text-muted-foreground">
                                                {vendor.contact_person}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {vendor.phone || '—'}
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium tabular-nums">
                                        {formatCurrency(
                                            Number(
                                                vendor.purchased_total ?? 0,
                                            ) - Number(vendor.paid_total ?? 0),
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge
                                            variant={
                                                vendor.is_active
                                                    ? 'secondary'
                                                    : 'outline'
                                            }
                                        >
                                            {vendor.is_active
                                                ? 'Active'
                                                : 'Inactive'}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                            {vendors.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-4 py-10 text-center text-muted-foreground"
                                    >
                                        No vendors yet. Tap “Create vendor”.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <VendorDialog
                open={creating}
                onOpenChange={setCreating}
                vendor={null}
            />
        </>
    );
}

VendorsIndex.layout = {
    breadcrumbs: [{ title: 'Vendors', href: index() }],
};
