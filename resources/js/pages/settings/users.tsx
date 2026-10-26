import { Form, Head } from '@inertiajs/react';
import UserController from '@/actions/App/Http/Controllers/Settings/UserController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import DeleteButton from '@/components/scrap/delete-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index } from '@/routes/users';

type CompanyUser = {
    id: number;
    name: string;
    email: string;
    role: 'owner' | 'admin';
};

export default function Users({ users }: { users: CompanyUser[] }) {
    return (
        <>
            <Head title="Users" />

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Add admin"
                    description="Admins can use weighment, purchase, sales, vendors and expenses only"
                />

                <Form
                    {...UserController.store.form()}
                    options={{ preserveScroll: true }}
                    resetOnSuccess
                    className="grid gap-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" name="name" required />
                                <InputError message={errors.name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">
                                    Email (used to log in)
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="off"
                                    required
                                />
                                <InputError message={errors.email} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        autoComplete="new-password"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">
                                        Confirm
                                    </Label>
                                    <PasswordInput
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        autoComplete="new-password"
                                        required
                                    />
                                </div>
                            </div>
                            <InputError message={errors.password} />
                            <Button disabled={processing}>Create admin</Button>
                        </>
                    )}
                </Form>

                <Heading variant="small" title="Users" />
                <ul className="divide-y rounded-lg border">
                    {users.map((user) => (
                        <li key={user.id} className="grid gap-3 p-4">
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="font-medium">{user.name}</p>
                                    <p className="truncate text-sm text-muted-foreground">
                                        {user.email}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Badge
                                        variant={
                                            user.role === 'owner'
                                                ? 'default'
                                                : 'secondary'
                                        }
                                        className="capitalize"
                                    >
                                        {user.role}
                                    </Badge>
                                    {user.role === 'admin' && (
                                        <DeleteButton
                                            action={UserController.destroy.form(
                                                user.id,
                                            )}
                                            title={`Remove ${user.name}?`}
                                            description="They will no longer be able to log in."
                                        />
                                    )}
                                </div>
                            </div>
                            <Form
                                {...UserController.updatePassword.form(user.id)}
                                options={{ preserveScroll: true }}
                                resetOnSuccess
                                className="grid gap-2"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="flex gap-2">
                                            <PasswordInput
                                                name="password"
                                                aria-label={`New password for ${user.name}`}
                                                placeholder="New password"
                                                autoComplete="new-password"
                                                required
                                            />
                                            <PasswordInput
                                                name="password_confirmation"
                                                aria-label="Confirm new password"
                                                placeholder="Confirm"
                                                autoComplete="new-password"
                                                required
                                            />
                                            <Button
                                                variant="outline"
                                                disabled={processing}
                                            >
                                                Set
                                            </Button>
                                        </div>
                                        <InputError message={errors.password} />
                                    </>
                                )}
                            </Form>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}

Users.layout = {
    breadcrumbs: [{ title: 'Users', href: index() }],
};
