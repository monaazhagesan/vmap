import { Form, Head, Link, router, useForm } from '@inertiajs/react';
import { X } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import SalaryController from '@/actions/App/Http/Controllers/SalaryController';
import InputError from '@/components/input-error';
import NativeSelect from '@/components/scrap/native-select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDate, formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import { index } from '@/routes/salary';
import type { AttendanceEntry, Candidate, SalaryRole } from '@/types/vmap';

type Tab = 'attendance' | 'candidates' | 'roles';

type Props = {
    tab: Tab;
    roles: SalaryRole[];
    candidates: Candidate[];
    entries: AttendanceEntry[];
    summary: {
        name: string;
        role: string;
        phone: string | null;
        days: number;
        amount: number;
    }[];
    filters: { from: string; to: string };
    today: string;
};

export default function SalaryIndex(props: Props) {
    const { tab, filters } = props;

    return (
        <>
            <Head title="Salary" />

            <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-4">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">
                        Salary
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Daily wages by role, counted in net profit
                    </p>
                </div>

                <nav className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1">
                    {(
                        [
                            ['attendance', 'Attendance'],
                            ['candidates', 'Candidates'],
                            ['roles', 'Roles'],
                        ] as [Tab, string][]
                    ).map(([key, label]) => (
                        <Link
                            key={key}
                            href={index({ query: { ...filters, tab: key } })}
                            preserveScroll
                            className={cn(
                                'rounded-md py-2 text-center text-sm font-medium transition-colors',
                                tab === key
                                    ? 'bg-background shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            {label}
                        </Link>
                    ))}
                </nav>

                {tab === 'attendance' && <AttendanceTab {...props} />}
                {tab === 'candidates' && <CandidatesTab {...props} />}
                {tab === 'roles' && <RolesTab {...props} />}
            </div>
        </>
    );
}

function AttendanceTab({
    candidates,
    entries,
    summary,
    filters,
    today,
}: Props) {
    const form = useForm({
        candidate_id: candidates[0] ? String(candidates[0].id) : '',
        date: today,
        days: '1',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();

        const duplicate = entries.some(
            (e) =>
                String(e.candidate_id) === form.data.candidate_id &&
                e.date === form.data.date,
        );

        if (
            duplicate &&
            !confirm(
                'This candidate already has an entry on this date. Add another?',
            )
        ) {
            return;
        }

        form.submit(SalaryController.storeAttendance(), {
            preserveScroll: true,
        });
    };

    const setRange = (key: 'from' | 'to', value: string) =>
        router.get(
            index.url(),
            { ...filters, [key]: value, tab: 'attendance' },
            { preserveScroll: true, preserveState: true, replace: true },
        );

    const totalDays = entries.reduce((sum, e) => sum + Number(e.days), 0);
    const totalAmount = entries.reduce(
        (sum, e) => sum + Number(e.days) * Number(e.rate),
        0,
    );

    return (
        <>
            {candidates.length === 0 ? (
                <div className="rounded-xl border p-8 text-center text-sm text-muted-foreground">
                    Create a role, then a candidate, to start adding attendance.
                </div>
            ) : (
                <form
                    onSubmit={submit}
                    className="grid gap-3 rounded-xl border p-4 sm:grid-cols-4 sm:items-end"
                >
                    <div className="grid gap-2 sm:col-span-2">
                        <Label htmlFor="candidate_id">Candidate</Label>
                        <NativeSelect
                            id="candidate_id"
                            value={form.data.candidate_id}
                            onChange={(e) =>
                                form.setData('candidate_id', e.target.value)
                            }
                        >
                            {candidates.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name} — {c.role.name} (₹
                                    {formatNumber(c.role.daily_rate)}/day)
                                </option>
                            ))}
                        </NativeSelect>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="att-date">Date</Label>
                        <Input
                            id="att-date"
                            type="date"
                            max={today}
                            value={form.data.date}
                            onChange={(e) =>
                                form.setData('date', e.target.value)
                            }
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="days">Days worked</Label>
                        <Input
                            id="days"
                            type="number"
                            inputMode="decimal"
                            step="0.5"
                            min="0.5"
                            value={form.data.days}
                            onChange={(e) =>
                                form.setData('days', e.target.value)
                            }
                        />
                    </div>
                    <InputError
                        className="sm:col-span-3"
                        message={
                            form.errors.candidate_id ??
                            form.errors.days ??
                            form.errors.date
                        }
                    />
                    <Button type="submit" disabled={form.processing}>
                        Add
                    </Button>
                </form>
            )}

            <div className="grid grid-cols-2 gap-2 sm:max-w-md">
                <div className="grid gap-2">
                    <Label htmlFor="from">From date</Label>
                    <Input
                        id="from"
                        type="date"
                        value={filters.from}
                        onChange={(e) => setRange('from', e.target.value)}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="to">To date</Label>
                    <Input
                        id="to"
                        type="date"
                        value={filters.to}
                        onChange={(e) => setRange('to', e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border">
                <h2 className="px-4 pt-4 font-medium">Per candidate (₹)</h2>
                <table className="mt-2 w-full text-sm">
                    <thead className="text-muted-foreground">
                        <tr className="border-b">
                            <th className="px-4 py-2 text-left font-medium">
                                Name
                            </th>
                            <th className="px-4 py-2 text-left font-medium">
                                Role
                            </th>
                            <th className="px-4 py-2 text-left font-medium">
                                Number
                            </th>
                            <th className="px-4 py-2 text-right font-medium">
                                Days
                            </th>
                            <th className="px-4 py-2 text-right font-medium">
                                Total salary
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {summary.map((row, i) => (
                            <tr key={i}>
                                <td className="px-4 py-2">{row.name}</td>
                                <td className="px-4 py-2">{row.role}</td>
                                <td className="px-4 py-2 text-muted-foreground">
                                    {row.phone || '—'}
                                </td>
                                <td className="px-4 py-2 text-right tabular-nums">
                                    {formatNumber(row.days)}
                                </td>
                                <td className="px-4 py-2 text-right font-semibold tabular-nums">
                                    {formatNumber(row.amount)}
                                </td>
                            </tr>
                        ))}
                        {summary.length === 0 && (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="px-4 py-6 text-center text-muted-foreground"
                                >
                                    No candidates yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot>
                        <tr className="border-t-2 font-semibold">
                            <td className="px-4 py-2" colSpan={3}>
                                Total
                            </td>
                            <td className="px-4 py-2 text-right tabular-nums">
                                {formatNumber(totalDays)}
                            </td>
                            <td className="px-4 py-2 text-right tabular-nums">
                                {formatNumber(totalAmount)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div className="overflow-x-auto rounded-xl border">
                <h2 className="px-4 pt-4 font-medium">Day-wise entries (₹)</h2>
                {entries.length === 0 ? (
                    <p className="p-6 text-center text-sm text-muted-foreground">
                        No entries in this date range.
                    </p>
                ) : (
                    <table className="mt-2 w-full text-sm">
                        <thead className="text-muted-foreground">
                            <tr className="border-b">
                                <th className="px-4 py-2 text-left font-medium">
                                    Date
                                </th>
                                <th className="px-4 py-2 text-left font-medium">
                                    Name
                                </th>
                                <th className="px-4 py-2 text-right font-medium">
                                    Per day
                                </th>
                                <th className="px-4 py-2 text-right font-medium">
                                    Days
                                </th>
                                <th className="px-4 py-2 text-right font-medium">
                                    Amount
                                </th>
                                <th className="w-10" />
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {[...entries].reverse().map((e) => (
                                <tr key={e.id}>
                                    <td className="px-4 py-2">
                                        {formatDate(e.date)}
                                    </td>
                                    <td className="px-4 py-2">
                                        {e.name}
                                        <span className="block text-xs text-muted-foreground">
                                            {e.role_name}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-right tabular-nums">
                                        {formatNumber(e.rate)}
                                    </td>
                                    <td className="px-4 py-2 text-right tabular-nums">
                                        {formatNumber(e.days)}
                                    </td>
                                    <td className="px-4 py-2 text-right font-semibold tabular-nums">
                                        {formatNumber(
                                            Number(e.days) * Number(e.rate),
                                        )}
                                    </td>
                                    <td className="px-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label="Delete entry"
                                            className="text-destructive"
                                            onClick={() =>
                                                confirm('Delete this entry?') &&
                                                router.delete(
                                                    SalaryController.destroyAttendance.url(
                                                        e.id,
                                                    ),
                                                    { preserveScroll: true },
                                                )
                                            }
                                        >
                                            <X />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
}

function CandidatesTab({ roles, candidates }: Props) {
    const [editing, setEditing] = useState<Candidate | null>(null);

    if (roles.length === 0) {
        return (
            <div className="rounded-xl border p-8 text-center text-sm text-muted-foreground">
                Create a role first (for example Driver or Labour).
            </div>
        );
    }

    return (
        <>
            <Form
                key={editing?.id ?? 'new'}
                {...(editing
                    ? SalaryController.updateCandidate.form(editing.id)
                    : SalaryController.storeCandidate.form())}
                options={{ preserveScroll: true }}
                resetOnSuccess
                onSuccess={() => setEditing(null)}
                className="grid gap-3 rounded-xl border p-4 sm:grid-cols-4 sm:items-end"
            >
                {({ processing, errors }) => (
                    <>
                        <h2 className="font-medium sm:col-span-4">
                            {editing ? 'Edit candidate' : 'Add candidate'}
                        </h2>
                        <div className="grid gap-2">
                            <Label htmlFor="cand-name">Name</Label>
                            <Input
                                id="cand-name"
                                name="name"
                                defaultValue={editing?.name}
                                required
                            />
                            <InputError message={errors.name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="cand-role">Role</Label>
                            <NativeSelect
                                id="cand-role"
                                name="salary_role_id"
                                defaultValue={editing?.salary_role_id}
                            >
                                {roles.map((r) => (
                                    <option key={r.id} value={r.id}>
                                        {r.name} (₹{formatNumber(r.daily_rate)}
                                        /day)
                                    </option>
                                ))}
                            </NativeSelect>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="cand-phone">Number</Label>
                            <Input
                                id="cand-phone"
                                name="phone"
                                type="tel"
                                defaultValue={editing?.phone ?? ''}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="submit"
                                className="flex-1"
                                disabled={processing}
                            >
                                {editing ? 'Update' : 'Save'}
                            </Button>
                            {editing && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setEditing(null)}
                                >
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </Form>

            <ul className="divide-y rounded-xl border">
                {candidates.map((c) => (
                    <li
                        key={c.id}
                        className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                    >
                        <div>
                            <p className="font-medium">{c.name}</p>
                            <p className="text-muted-foreground">
                                {c.role.name} · {c.phone || '—'}
                            </p>
                        </div>
                        <div className="flex gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditing(c)}
                            >
                                Edit
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                                onClick={() =>
                                    confirm(
                                        'Delete this candidate? Past salary entries are kept.',
                                    ) &&
                                    router.delete(
                                        SalaryController.destroyCandidate.url(
                                            c.id,
                                        ),
                                        { preserveScroll: true },
                                    )
                                }
                            >
                                Delete
                            </Button>
                        </div>
                    </li>
                ))}
                {candidates.length === 0 && (
                    <li className="p-6 text-center text-sm text-muted-foreground">
                        No candidates yet.
                    </li>
                )}
            </ul>
        </>
    );
}

function RolesTab({ roles }: Props) {
    const [editing, setEditing] = useState<SalaryRole | null>(null);

    return (
        <>
            <Form
                key={editing?.id ?? 'new'}
                {...(editing
                    ? SalaryController.updateRole.form(editing.id)
                    : SalaryController.storeRole.form())}
                options={{ preserveScroll: true }}
                resetOnSuccess
                onSuccess={() => setEditing(null)}
                className="grid gap-3 rounded-xl border p-4 sm:grid-cols-3 sm:items-end"
            >
                {({ processing, errors }) => (
                    <>
                        <h2 className="font-medium sm:col-span-3">
                            {editing ? 'Edit role' : 'Create role'}
                        </h2>
                        <div className="grid gap-2">
                            <Label htmlFor="role-name">Role name</Label>
                            <Input
                                id="role-name"
                                name="name"
                                placeholder="Driver, Labour, Supervisor…"
                                defaultValue={editing?.name}
                                required
                            />
                            <InputError message={errors.name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="role-rate">
                                Fixed amount per day (₹)
                            </Label>
                            <Input
                                id="role-rate"
                                name="daily_rate"
                                type="number"
                                inputMode="decimal"
                                step="0.01"
                                min="0"
                                defaultValue={editing?.daily_rate}
                                required
                            />
                            <InputError message={errors.daily_rate} />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="submit"
                                className="flex-1"
                                disabled={processing}
                            >
                                {editing ? 'Update' : 'Save'} role
                            </Button>
                            {editing && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setEditing(null)}
                                >
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </Form>

            <ul className="divide-y rounded-xl border">
                {roles.map((r) => (
                    <li
                        key={r.id}
                        className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                    >
                        <div>
                            <p className="font-medium">{r.name}</p>
                            <p className="text-muted-foreground">
                                {r.candidates_count} candidates
                            </p>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="mr-2 font-semibold tabular-nums">
                                ₹{formatNumber(r.daily_rate)}/day
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditing(r)}
                            >
                                Edit
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                                onClick={() =>
                                    confirm('Delete this role?') &&
                                    router.delete(
                                        SalaryController.destroyRole.url(r.id),
                                        { preserveScroll: true },
                                    )
                                }
                            >
                                Delete
                            </Button>
                        </div>
                    </li>
                ))}
                {roles.length === 0 && (
                    <li className="p-6 text-center text-sm text-muted-foreground">
                        No roles yet.
                    </li>
                )}
            </ul>
        </>
    );
}

SalaryIndex.layout = {
    breadcrumbs: [{ title: 'Salary', href: index() }],
};
