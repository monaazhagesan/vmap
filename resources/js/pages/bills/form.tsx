import { Head, Link, router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import BillController from '@/actions/App/Http/Controllers/BillController';
import InputError from '@/components/input-error';
import NativeSelect from '@/components/scrap/native-select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency, formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
    create,
    index as billsIndex,
    salesVehicleWeight as toggleVehicleWeight,
} from '@/routes/bills';
import type { Bill, BillType } from '@/types/vmap';

type Props = {
    bill: Bill | null;
    type: BillType;
    party: string;
    materials: string[];
    parties: string[];
    salesVehicleWeight: boolean;
    today: string;
};

export default function BillForm({
    bill,
    type,
    party,
    materials,
    parties,
    salesVehicleWeight,
    today,
}: Props) {
    const isSales = type === 'sales';
    const label = isSales ? 'sales' : 'purchase';
    // Purchases always deduct the vehicle; sales only when switched on (or the bill already has one).
    const useVehicleWeight =
        !isSales ||
        (bill ? Number(bill.vehicle_weight) > 0 : salesVehicleWeight);

    const form = useForm({
        type,
        date: bill?.date ?? today,
        vehicle_number: bill?.vehicle_number ?? '',
        party_name: bill?.party_name ?? party,
        material: bill?.material ?? materials[0] ?? '',
        gross_weight: bill ? String(Number(bill.gross_weight)) : '',
        vehicle_weight:
            bill && Number(bill.vehicle_weight) > 0
                ? String(Number(bill.vehicle_weight))
                : '',
        rate: bill ? String(Number(bill.rate)) : '',
    });

    const net = Math.max(
        0,
        (Number(form.data.gross_weight) || 0) -
            (useVehicleWeight ? Number(form.data.vehicle_weight) || 0 : 0),
    );
    const amount = net * (Number(form.data.rate) || 0);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.transform((data) => ({
            ...data,
            vehicle_weight: useVehicleWeight ? data.vehicle_weight : '',
        }));
        form.submit(
            bill ? BillController.update(bill.id) : BillController.store(),
        );
    };

    return (
        <>
            <Head
                title={bill ? `Edit bill ${bill.bill_no}` : 'New weighment'}
            />

            <form
                onSubmit={submit}
                className="mx-auto flex w-full max-w-xl flex-col gap-4 p-4"
            >
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">
                        {bill
                            ? `Edit ${label} bill ${bill.bill_no}`
                            : 'New weighment'}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Net weight × rate = amount
                    </p>
                </div>

                {!bill && (
                    <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
                        {(['purchase', 'sales'] as const).map((t) => (
                            <Link
                                key={t}
                                href={create({ query: { type: t } })}
                                preserveScroll
                                className={cn(
                                    'rounded-md py-2 text-center text-sm font-medium capitalize transition-colors',
                                    type === t
                                        ? 'bg-background shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                {t}
                            </Link>
                        ))}
                    </div>
                )}

                {isSales && !bill && (
                    <label className="flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2.5 text-sm">
                        <span>
                            Vehicle weight:{' '}
                            <b>{salesVehicleWeight ? 'ON' : 'OFF'}</b>
                            <span className="block text-xs text-muted-foreground">
                                Deduct the empty vehicle's weight on sales
                            </span>
                        </span>
                        <input
                            type="checkbox"
                            role="switch"
                            className="peer sr-only"
                            checked={salesVehicleWeight}
                            onChange={() =>
                                router.post(
                                    toggleVehicleWeight.url(),
                                    {},
                                    {
                                        preserveScroll: true,
                                        preserveState: true,
                                    },
                                )
                            }
                        />
                        <span className="relative h-6 w-11 rounded-full bg-input transition-colors peer-checked:bg-primary peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/50 after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-background after:transition-transform peer-checked:after:translate-x-5" />
                    </label>
                )}

                <div className="grid gap-4 rounded-xl border p-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label htmlFor="vehicle_number">
                                Vehicle number
                            </Label>
                            <Input
                                id="vehicle_number"
                                value={form.data.vehicle_number}
                                onChange={(e) =>
                                    form.setData(
                                        'vehicle_number',
                                        e.target.value.toUpperCase(),
                                    )
                                }
                                placeholder="TN 59 AB 1234"
                                autoCapitalize="characters"
                                required
                                autoFocus
                            />
                            <InputError message={form.errors.vehicle_number} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="date">Date</Label>
                            <Input
                                id="date"
                                type="date"
                                max={today}
                                value={form.data.date}
                                onChange={(e) =>
                                    form.setData('date', e.target.value)
                                }
                                required
                            />
                            <InputError message={form.errors.date} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="party_name">
                            {isSales ? 'Customer' : 'Vendor'} name
                        </Label>
                        <Input
                            id="party_name"
                            list="parties"
                            value={form.data.party_name}
                            onChange={(e) =>
                                form.setData('party_name', e.target.value)
                            }
                            placeholder="Name"
                            required
                        />
                        <datalist id="parties">
                            {parties.map((p) => (
                                <option key={p} value={p} />
                            ))}
                        </datalist>
                        <InputError message={form.errors.party_name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="material">Material</Label>
                        <NativeSelect
                            id="material"
                            value={form.data.material}
                            onChange={(e) =>
                                form.setData('material', e.target.value)
                            }
                            required
                        >
                            {materials.length === 0 && (
                                <option value="">
                                    Owner must add materials in Settings
                                </option>
                            )}
                            {materials.map((m) => (
                                <option key={m} value={m}>
                                    {m}
                                </option>
                            ))}
                        </NativeSelect>
                        <InputError message={form.errors.material} />
                    </div>

                    <div
                        className={cn(
                            'grid gap-3',
                            useVehicleWeight && 'grid-cols-2',
                        )}
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="gross_weight">
                                {useVehicleWeight
                                    ? 'Gross weight (kg)'
                                    : 'Weight (kg)'}
                            </Label>
                            <Input
                                id="gross_weight"
                                type="number"
                                inputMode="decimal"
                                step="0.001"
                                min="0"
                                value={form.data.gross_weight}
                                onChange={(e) =>
                                    form.setData('gross_weight', e.target.value)
                                }
                                required
                            />
                            <InputError message={form.errors.gross_weight} />
                        </div>
                        {useVehicleWeight && (
                            <div className="grid gap-2">
                                <Label htmlFor="vehicle_weight">
                                    Vehicle weight (kg)
                                </Label>
                                <Input
                                    id="vehicle_weight"
                                    type="number"
                                    inputMode="decimal"
                                    step="0.001"
                                    min="0"
                                    value={form.data.vehicle_weight}
                                    onChange={(e) =>
                                        form.setData(
                                            'vehicle_weight',
                                            e.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={form.errors.vehicle_weight}
                                />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label htmlFor="rate">Rate (₹/kg)</Label>
                            <Input
                                id="rate"
                                type="number"
                                inputMode="decimal"
                                step="0.01"
                                min="0"
                                value={form.data.rate}
                                onChange={(e) =>
                                    form.setData('rate', e.target.value)
                                }
                                required
                            />
                            <InputError message={form.errors.rate} />
                        </div>
                        <div className="grid gap-2">
                            <span className="text-sm font-medium">
                                Net weight
                            </span>
                            <span className="text-2xl font-bold tabular-nums">
                                {formatNumber(net)} kg
                            </span>
                        </div>
                    </div>

                    <div className="rounded-lg bg-muted px-4 py-3">
                        <span className="text-sm text-muted-foreground">
                            Amount
                        </span>
                        <p className="text-3xl font-bold tabular-nums">
                            {formatCurrency(amount)}
                        </p>
                    </div>

                    <Button
                        type="submit"
                        size="lg"
                        disabled={form.processing || materials.length === 0}
                    >
                        {bill ? 'Update' : 'Save'} {label} bill
                    </Button>
                    {bill && (
                        <Button variant="outline" asChild>
                            <Link href={billsIndex(type)}>Cancel</Link>
                        </Button>
                    )}
                </div>
            </form>
        </>
    );
}

BillForm.layout = (props: Props) => ({
    breadcrumbs: props.bill
        ? [
              {
                  title:
                      props.type === 'sales'
                          ? 'Sales orders'
                          : 'Purchase orders',
                  href: billsIndex(props.type),
              },
              { title: `Edit ${props.bill.bill_no}`, href: create() },
          ]
        : [{ title: 'New weighment', href: create() }],
});
