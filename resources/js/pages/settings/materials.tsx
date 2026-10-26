import { Form, Head, router } from '@inertiajs/react';
import MaterialController from '@/actions/App/Http/Controllers/Settings/MaterialController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { index } from '@/routes/materials';

export default function Materials({
    materials,
}: {
    materials: { id: number; name: string }[];
}) {
    return (
        <>
            <Head title="Materials" />

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Materials"
                    description="The materials offered on the weighment form"
                />

                <Form
                    {...MaterialController.store.form()}
                    options={{ preserveScroll: true }}
                    resetOnSuccess
                    className="flex gap-2"
                >
                    {({ processing, errors }) => (
                        <div className="grid flex-1 gap-2">
                            <div className="flex gap-2">
                                <Input
                                    name="name"
                                    aria-label="New material name"
                                    placeholder="e.g. Shredded scrap"
                                    required
                                />
                                <Button disabled={processing}>
                                    Add material
                                </Button>
                            </div>
                            <InputError message={errors.name} />
                        </div>
                    )}
                </Form>

                <ul className="divide-y rounded-lg border">
                    {materials.map((material) => (
                        <li
                            key={material.id}
                            className="flex items-center justify-between px-4 py-2 text-sm"
                        >
                            {material.name}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                                onClick={() =>
                                    router.delete(
                                        MaterialController.destroy.url(
                                            material.id,
                                        ),
                                        { preserveScroll: true },
                                    )
                                }
                            >
                                Remove
                            </Button>
                        </li>
                    ))}
                    {materials.length === 0 && (
                        <li className="p-6 text-center text-sm text-muted-foreground">
                            No materials yet.
                        </li>
                    )}
                </ul>
            </div>
        </>
    );
}

Materials.layout = {
    breadcrumbs: [{ title: 'Materials', href: index() }],
};
