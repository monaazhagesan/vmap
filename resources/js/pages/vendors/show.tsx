import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, X } from 'lucide-react';
import { useState } from 'react';
import VendorEntryController from '@/actions/App/Http/Controllers/VendorEntryController';
import InputError from '@/components/input-error';
import { PhotoPickers, PhotoThumbs } from '@/components/scrap/bill-photos';
import MoneySummary from '@/components/scrap/money-summary';
import VendorDialog from '@/components/scrap/vendor-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDate, formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import { index, show } from '@/routes/vendors';
import { store as storePhoto } from '@/routes/vendors/photos';
import type { BillPhoto, LedgerLine, Vendor } from '@/types/vmap';

type Props = {
    vendor: Vendor;
    ledger: LedgerLine[];
    photos: BillPhoto[];
    today: string;
};

export default function VendorShow({ vendor, ledger, photos, today }: Props) {
    const [editing, setEditing] = useState(false);
    const [note, setNote] = useState('');
    const entry = useForm({ type: 'purchase', amount: '', date: today });
    const purchased = Number(vendor.purchased_total ?? 0);
    const paid = Number(vendor.paid_total ?? 0);

    const addEntry = (type: 'purchase' | 'paid') => {
        entry.transform((data) => ({ ...data, type }));
        entry.submit(VendorEntryController.store(vendor.id), {
            preserveScroll: true,
            onSuccess: () => entry.reset('amount'),
        });
    };

    const uploadPhoto = (file: File) =>
        router.post(
            storePhoto.url(vendor.id),
            { photo: file, note },
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => setNote(''),
            },
        );

    return (
        <>
            <Head title={vendor.name} />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">
                            {vendor.name}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {vendor.place || 'Vendor ledger'}
                        </p>
                    </div>
                    <Badge variant={vendor.is_active ? 'secondary' : 'outline'}>
                        {vendor.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                </div>

                <MoneySummary purchased={purchased} paid={paid} />

                <div className="grid gap-4 lg:grid-cols-3">
                    <div className="flex flex-col gap-4">
                        <form
                            onSubmit={(e) => e.preventDefault()}
                            className="grid gap-3 rounded-xl border p-4"
                        >
                            <h2 className="font-medium">Add entry</h2>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="amount">Amount (₹)</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        inputMode="decimal"
                                        step="0.01"
                                        min="0"
                                        value={entry.data.amount}
                                        onChange={(e) =>
                                            entry.setData(
                                                'amount',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="date">Date</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        max={today}
                                        value={entry.data.date}
                                        onChange={(e) =>
                                            entry.setData(
                                                'date',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                            </div>
                            <InputError
                                message={
                                    entry.errors.amount ?? entry.errors.date
                                }
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    type="button"
                                    disabled={entry.processing}
                                    onClick={() => addEntry('purchase')}
                                >
                                    Add purchase
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    disabled={entry.processing}
                                    onClick={() => addEntry('paid')}
                                >
                                    Add paid
                                </Button>
                            </div>
                        </form>

                        <div className="rounded-xl border p-4">
                            <div className="flex items-center justify-between">
                                <h2 className="font-medium">Vendor details</h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditing(true)}
                                >
                                    <Pencil /> Edit
                                </Button>
                            </div>
                            <dl className="mt-2 divide-y text-sm">
                                {[
                                    ['Contact person', vendor.contact_person],
                                    ['Phone', vendor.phone],
                                    ['Email', vendor.email],
                                    ['Place', vendor.place],
                                ].map(([label, value]) => (
                                    <div
                                        key={label}
                                        className="flex justify-between gap-4 py-2"
                                    >
                                        <dt className="text-muted-foreground">
                                            {label}
                                        </dt>
                                        <dd className="truncate">
                                            {value || '—'}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-xl border lg:col-span-2">
                        <h2 className="px-4 pt-4 font-medium">
                            Date-wise ledger{' '}
                            <span className="text-sm font-normal text-muted-foreground">
                                (₹)
                            </span>
                        </h2>
                        {ledger.length === 0 ? (
                            <p className="p-8 text-center text-sm text-muted-foreground">
                                No entries yet. Add a purchase or a payment.
                            </p>
                        ) : (
                            <table className="mt-2 w-full text-sm">
                                <thead className="text-muted-foreground">
                                    <tr className="border-b">
                                        <th className="px-4 py-2 text-left font-medium">
                                            Date
                                        </th>
                                        <th className="px-4 py-2 text-right font-medium">
                                            Purchase
                                        </th>
                                        <th className="px-4 py-2 text-right font-medium">
                                            Paid
                                        </th>
                                        <th className="px-4 py-2 text-right font-medium">
                                            Balance
                                        </th>
                                        <th className="w-10" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {ledger.map((line) => (
                                        <tr key={line.id}>
                                            <td className="px-4 py-2">
                                                {formatDate(line.date)}
                                            </td>
                                            <td className="px-4 py-2 text-right tabular-nums">
                                                {line.type === 'purchase'
                                                    ? formatNumber(line.amount)
                                                    : '—'}
                                            </td>
                                            <td className="px-4 py-2 text-right tabular-nums">
                                                {line.type === 'paid'
                                                    ? formatNumber(line.amount)
                                                    : '—'}
                                            </td>
                                            <td
                                                className={cn(
                                                    'px-4 py-2 text-right font-medium tabular-nums',
                                                    line.balance > 0 &&
                                                        'text-[#c23534] dark:text-[#ef8a8a]',
                                                )}
                                            >
                                                {formatNumber(line.balance)}
                                            </td>
                                            <td className="px-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label="Delete entry"
                                                    className="text-destructive"
                                                    onClick={() =>
                                                        confirm(
                                                            'Delete this entry?',
                                                        ) &&
                                                        router.delete(
                                                            VendorEntryController.destroy.url(
                                                                {
                                                                    vendor: vendor.id,
                                                                    entry: line.id,
                                                                },
                                                            ),
                                                            {
                                                                preserveScroll: true,
                                                            },
                                                        )
                                                    }
                                                >
                                                    <X />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t-2 font-semibold">
                                        <td className="px-4 py-2">Total</td>
                                        <td className="px-4 py-2 text-right tabular-nums">
                                            {formatNumber(purchased)}
                                        </td>
                                        <td className="px-4 py-2 text-right tabular-nums">
                                            {formatNumber(paid)}
                                        </td>
                                        <td className="px-4 py-2 text-right tabular-nums">
                                            {formatNumber(purchased - paid)}
                                        </td>
                                        <td />
                                    </tr>
                                </tfoot>
                            </table>
                        )}
                    </div>
                </div>

                <div className="grid gap-3 rounded-xl border p-4">
                    <h2 className="font-medium">
                        Vendor bill photos ({photos.length})
                    </h2>
                    <div className="grid gap-2 sm:max-w-md">
                        <Label htmlFor="note">Note (optional)</Label>
                        <Input
                            id="note"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Bill number or item"
                        />
                        <PhotoPickers onPick={uploadPhoto} />
                    </div>
                    <PhotoThumbs photos={photos} />
                </div>
            </div>

            <VendorDialog
                open={editing}
                onOpenChange={setEditing}
                vendor={vendor}
            />
        </>
    );
}

VendorShow.layout = (props: Props) => ({
    breadcrumbs: [
        { title: 'Vendors', href: index() },
        { title: props.vendor.name, href: show(props.vendor.id) },
    ],
});
