import { Head, Link } from '@inertiajs/react';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logout } from '@/routes';

/**
 * Shown to admins once the company's plan has expired.
 */
export default function SubscriptionExpired() {
    return (
        <>
            <Head title="Plan expired" />
            <div className="mx-auto flex max-w-md flex-col items-center gap-4 p-10 text-center">
                <div className="grid size-14 place-items-center rounded-full bg-muted">
                    <Clock className="size-7" />
                </div>
                <h1 className="text-xl font-semibold">Plan expired</h1>
                <p className="text-muted-foreground">
                    The subscription has ended. Please ask the Owner to renew
                    it.
                </p>
                <Button variant="outline" asChild>
                    <Link href={logout()} as="button">
                        Log out
                    </Link>
                </Button>
            </div>
        </>
    );
}
