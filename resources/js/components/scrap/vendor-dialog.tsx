import { Form } from '@inertiajs/react';
import VendorController from '@/actions/App/Http/Controllers/VendorController';
import InputError from '@/components/input-error';
import NativeSelect from '@/components/scrap/native-select';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Vendor } from '@/types/vmap';

/**
 * Create a vendor (vendor = null) or edit one.
 */
export default function VendorDialog({
    open,
    onOpenChange,
    vendor,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    vendor: Vendor | null;
}) {
    const fields: [keyof Vendor, string, string?][] = [
        ['name', 'Vendor name'],
        ['contact_person', 'Contact person'],
        ['phone', 'Phone number', 'tel'],
        ['email', 'Email', 'email'],
        ['place', 'Place'],
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogTitle>
                    {vendor ? 'Edit vendor' : 'Create vendor'}
                </DialogTitle>
                <DialogDescription>
                    Vendors you buy scrap from on credit.
                </DialogDescription>
                <Form
                    key={vendor?.id ?? 'new'}
                    {...(vendor
                        ? VendorController.update.form(vendor.id)
                        : VendorController.store.form())}
                    options={{ preserveScroll: true }}
                    onSuccess={() => onOpenChange(false)}
                    className="grid gap-3 sm:grid-cols-2"
                >
                    {({ processing, errors }) => (
                        <>
                            {fields.map(([name, label, type]) => (
                                <div key={name} className="grid gap-2">
                                    <Label htmlFor={name}>{label}</Label>
                                    <Input
                                        id={name}
                                        name={name}
                                        type={type ?? 'text'}
                                        defaultValue={
                                            (vendor?.[name] as string | null) ??
                                            ''
                                        }
                                        required={name === 'name'}
                                        autoFocus={name === 'name'}
                                    />
                                    <InputError message={errors[name]} />
                                </div>
                            ))}
                            <div className="grid gap-2">
                                <Label htmlFor="is_active">Status</Label>
                                <NativeSelect
                                    id="is_active"
                                    name="is_active"
                                    defaultValue={
                                        vendor && !vendor.is_active ? '0' : '1'
                                    }
                                >
                                    <option value="1">Active</option>
                                    <option value="0">Inactive</option>
                                </NativeSelect>
                            </div>
                            <DialogFooter className="sm:col-span-2">
                                <Button type="submit" disabled={processing}>
                                    Save vendor
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
