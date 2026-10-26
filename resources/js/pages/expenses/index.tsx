import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import ExpenseController from '@/actions/App/Http/Controllers/ExpenseController';
import InputError from '@/components/input-error';
import { PhotoPickers, PhotoThumbs } from '@/components/scrap/bill-photos';
import DeleteButton from '@/components/scrap/delete-button';
import FilterBar from '@/components/scrap/filter-bar';
import PageHeader from '@/components/scrap/page-header';
import Pagination from '@/components/scrap/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency, formatDate } from '@/lib/format';
import { index } from '@/routes/expenses';
import type { Expense, Paginated } from '@/types/vmap';

type Props = {
    expenses: Paginated<Expense>;
    total: number;
    filters: { from: string | null; to: string | null };
    today: string;
};

export default function ExpensesIndex({
    expenses,
    total,
    filters,
    today,
}: Props) {
    const form = useForm<{
        item: string;
        amount: string;
        date: string;
        photo: File | null;
    }>({ item: '', amount: '', date: today, photo: null });
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (!form.data.photo) {
            setPreview(null);

            return;
        }

        const url = URL.createObjectURL(form.data.photo);
        setPreview(url);

        return () => URL.revokeObjectURL(url);
    }, [form.data.photo]);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.submit(ExpenseController.store(), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => form.reset('item', 'amount', 'photo'),
        });
    };

    return (
        <>
            <Head title="Immediate expenses" />

            <div className="grid gap-4 p-4 lg:grid-cols-3">
                <form
                    onSubmit={submit}
                    className="grid h-fit gap-3 rounded-xl border p-4"
                >
                    <h1 className="text-lg font-semibold">
                        Immediate expenses
                    </h1>
                    <div className="grid gap-2">
                        <Label htmlFor="item">Item</Label>
                        <Input
                            id="item"
                            value={form.data.item}
                            onChange={(e) =>
                                form.setData('item', e.target.value)
                            }
                            placeholder="Diesel, labour, tea…"
                            required
                        />
                        <InputError message={form.errors.item} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label htmlFor="amount">Amount (₹)</Label>
                            <Input
                                id="amount"
                                type="number"
                                inputMode="decimal"
                                step="0.01"
                                min="0"
                                value={form.data.amount}
                                onChange={(e) =>
                                    form.setData('amount', e.target.value)
                                }
                                required
                            />
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
                        </div>
                    </div>
                    <InputError
                        message={form.errors.amount ?? form.errors.date}
                    />
                    <div className="grid gap-2">
                        <Label>Bill photo (optional)</Label>
                        <PhotoPickers
                            onPick={(file) => form.setData('photo', file)}
                        />
                        {preview && (
                            <div className="flex items-center gap-3">
                                <img
                                    src={preview}
                                    alt="Bill preview"
                                    className="size-16 rounded-md object-cover"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive"
                                    onClick={() => form.setData('photo', null)}
                                >
                                    Remove photo
                                </Button>
                            </div>
                        )}
                        <InputError message={form.errors.photo} />
                    </div>
                    <Button type="submit" disabled={form.processing}>
                        Add expense
                    </Button>
                </form>

                <div className="flex flex-col gap-4 lg:col-span-2">
                    <PageHeader
                        title={`Total ${formatCurrency(total)}`}
                        description={
                            filters.from || filters.to
                                ? 'For the selected dates'
                                : 'All time'
                        }
                    />
                    <FilterBar
                        url={index.url()}
                        search={null}
                        hasFilters={!!(filters.from || filters.to)}
                        searchable={false}
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

                    <ul className="divide-y rounded-xl border">
                        {expenses.data.map((expense) => (
                            <li
                                key={expense.id}
                                className="flex flex-wrap items-start justify-between gap-3 px-4 py-3"
                            >
                                <div className="grid gap-2">
                                    <div>
                                        <p className="font-medium">
                                            {expense.item}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDate(expense.date)}
                                        </p>
                                    </div>
                                    <PhotoThumbs
                                        photos={expense.photos}
                                        size="sm"
                                    />
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="font-semibold tabular-nums">
                                        {formatCurrency(expense.amount)}
                                    </span>
                                    <DeleteButton
                                        action={ExpenseController.destroy.form(
                                            expense.id,
                                        )}
                                        title={`Delete “${expense.item}”?`}
                                        description="The expense and its bill photos will be deleted."
                                    />
                                </div>
                            </li>
                        ))}
                        {expenses.data.length === 0 && (
                            <li className="p-10 text-center text-sm text-muted-foreground">
                                No expenses yet.
                            </li>
                        )}
                    </ul>
                    <Pagination page={expenses} />
                </div>
            </div>
        </>
    );
}

ExpensesIndex.layout = {
    breadcrumbs: [{ title: 'Immediate expenses', href: index() }],
};
