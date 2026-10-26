import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import SubscriptionController from '@/actions/App/Http/Controllers/SubscriptionController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import { show } from '@/routes/subscription';

type Plan = {
    key: 'day' | 'month' | 'year';
    name: string;
    price: number;
    days: number;
    per: string;
};

type Props = {
    subscription: { plan: string; expiresAt: string | null; active: boolean };
    plans: Plan[];
    dayPrice: number;
    whatsapp: string;
    upiId: string;
};

function timeLeft(expiresAt: string | null) {
    const ms = expiresAt ? new Date(expiresAt).getTime() - Date.now() : 0;

    if (ms <= 0) {
        return 'Expired';
    }

    const hours = Math.ceil(ms / 36e5);

    if (hours < 24) {
        return `${hours} hour${hours > 1 ? 's' : ''} left`;
    }

    const days = Math.ceil(ms / 864e5);

    return `${days} day${days > 1 ? 's' : ''} left`;
}

export default function Subscription({
    subscription,
    plans,
    dayPrice,
    whatsapp,
    upiId,
}: Props) {
    const [days, setDays] = useState(1);
    const [selected, setSelected] = useState<{
        key: Plan['key'];
        name: string;
        days: number;
        amount: number;
    } | null>(null);

    const choose = (plan: Plan) => {
        const d =
            plan.key === 'day' ? Math.max(1, Math.min(30, days)) : plan.days;

        setSelected({
            key: plan.key,
            name:
                plan.key === 'day' ? `${d} day${d > 1 ? 's' : ''}` : plan.name,
            days: d,
            amount: plan.key === 'day' ? dayPrice * d : plan.price,
        });
    };

    const message = selected
        ? `Vmap Scrap Software - ${selected.name} (${selected.days} days) Rs.${selected.amount}. Payment done, please send the activation code.`
        : '';

    return (
        <>
            <Head title="Subscription" />

            <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">
                        Subscription
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Choose a plan, pay, then enter your activation code
                    </p>
                </div>

                <div className="rounded-xl border p-4">
                    <h2 className="font-medium">Current plan</h2>
                    <dl className="mt-2 divide-y text-sm">
                        <div className="flex justify-between py-2">
                            <dt className="text-muted-foreground">Plan</dt>
                            <dd>{subscription.plan}</dd>
                        </div>
                        <div className="flex justify-between py-2">
                            <dt className="text-muted-foreground">
                                Valid until
                            </dt>
                            <dd>
                                {subscription.expiresAt
                                    ? new Date(
                                          subscription.expiresAt,
                                      ).toLocaleString('en-IN', {
                                          day: '2-digit',
                                          month: 'short',
                                          year: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                      })
                                    : '—'}
                            </dd>
                        </div>
                        <div className="flex justify-between py-2">
                            <dt className="text-muted-foreground">Status</dt>
                            <dd
                                className={cn(
                                    'font-semibold',
                                    subscription.active
                                        ? 'text-green-700 dark:text-green-400'
                                        : 'text-destructive',
                                )}
                            >
                                {subscription.active
                                    ? `Active · ${timeLeft(subscription.expiresAt)}`
                                    : 'Expired'}
                            </dd>
                        </div>
                    </dl>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    {plans.map((plan) => (
                        <div
                            key={plan.key}
                            className={cn(
                                'flex flex-col gap-3 rounded-xl border p-4',
                                selected?.key === plan.key &&
                                    'border-primary ring-1 ring-primary',
                            )}
                        >
                            <div>
                                <p className="font-semibold">{plan.name}</p>
                                <p className="text-2xl font-bold">
                                    {formatCurrency(plan.price)}
                                    <span className="text-sm font-normal text-muted-foreground">
                                        {' '}
                                        {plan.per}
                                    </span>
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {plan.key === 'day'
                                        ? 'Pay only for the days you need'
                                        : `${plan.days} days · Save ${formatCurrency(plan.days * dayPrice - plan.price)}`}
                                </p>
                            </div>
                            {plan.key === 'day' && (
                                <div className="grid gap-1">
                                    <Label htmlFor="days">
                                        Number of days (1 to 30)
                                    </Label>
                                    <Input
                                        id="days"
                                        type="number"
                                        min={1}
                                        max={30}
                                        value={days}
                                        onChange={(e) =>
                                            setDays(Number(e.target.value) || 1)
                                        }
                                    />
                                </div>
                            )}
                            <Button
                                className="mt-auto"
                                variant="outline"
                                onClick={() => choose(plan)}
                            >
                                Choose {plan.name}
                            </Button>
                        </div>
                    ))}
                </div>

                {selected && (
                    <div className="rounded-xl border border-primary p-4">
                        <h2 className="font-semibold">
                            Pay {formatCurrency(selected.amount)} for{' '}
                            {selected.name}
                        </h2>
                        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
                            <li>
                                Pay {formatCurrency(selected.amount)} to Vmap by
                                UPI or bank transfer.
                            </li>
                            <li>
                                Send the payment screenshot to Vmap on WhatsApp.
                            </li>
                            <li>
                                You will get an activation code. Enter it below.
                            </li>
                        </ol>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {upiId && (
                                <Button asChild>
                                    <a
                                        href={`upi://pay?pa=${encodeURIComponent(upiId)}&pn=Vmap&am=${selected.amount}&cu=INR`}
                                    >
                                        Pay by UPI
                                    </a>
                                </Button>
                            )}
                            <Button variant="secondary" asChild>
                                <a
                                    href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Send on WhatsApp
                                </a>
                            </Button>
                        </div>
                    </div>
                )}

                <Form
                    {...SubscriptionController.activate.form()}
                    options={{ preserveScroll: true }}
                    resetOnSuccess
                    className="grid gap-3 rounded-xl border p-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <h2 className="font-medium">Activation code</h2>
                            <div className="grid gap-2">
                                <Label htmlFor="code">
                                    Enter the code you received
                                </Label>
                                <Input
                                    id="code"
                                    name="code"
                                    placeholder="VM-030-XXXXX-XXXXX"
                                    autoCapitalize="characters"
                                    autoComplete="off"
                                    required
                                />
                                <InputError message={errors.code} />
                            </div>
                            <Button type="submit" disabled={processing}>
                                Activate
                            </Button>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

Subscription.layout = {
    breadcrumbs: [{ title: 'Subscription', href: show() }],
};
