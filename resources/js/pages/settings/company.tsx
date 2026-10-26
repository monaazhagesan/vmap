import { Form, Head } from '@inertiajs/react';
import CompanyController from '@/actions/App/Http/Controllers/Settings/CompanyController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/company';
import type { CompanyDetails } from '@/types/vmap';

export default function Company({ company }: { company: CompanyDetails }) {
    return (
        <>
            <Head title="Company details" />

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Company details"
                    description="Printed at the top of every bill and report"
                />

                <Form
                    {...CompanyController.update.form()}
                    options={{ preserveScroll: true }}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Company name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={company.name}
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="registration_number">
                                    Registration number (GST / Udyam)
                                </Label>
                                <Input
                                    id="registration_number"
                                    name="registration_number"
                                    defaultValue={
                                        company.registration_number ?? ''
                                    }
                                />
                                <InputError
                                    message={errors.registration_number}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="address">
                                    Address for billing
                                </Label>
                                <textarea
                                    id="address"
                                    name="address"
                                    rows={3}
                                    defaultValue={company.address ?? ''}
                                    className="rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
                                />
                                <InputError message={errors.address} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    defaultValue={company.phone ?? ''}
                                />
                                <InputError message={errors.phone} />
                            </div>
                            <Button disabled={processing}>Save company</Button>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

Company.layout = {
    breadcrumbs: [{ title: 'Company details', href: edit() }],
};
