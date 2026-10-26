import { Form } from '@inertiajs/react';
import { Camera, ImageUp, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { destroy, show } from '@/routes/photos';
import type { BillPhoto } from '@/types/vmap';

/**
 * Scale a phone photo down to at most 1600px and re-encode it as JPEG,
 * so uploads stay small. Falls back to the original if the browser can't decode it.
 */
async function shrink(file: File): Promise<File> {
    try {
        const bitmap = await createImageBitmap(file);
        const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(bitmap.width * scale);
        canvas.height = Math.round(bitmap.height * scale);
        canvas
            .getContext('2d')
            ?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        bitmap.close();

        const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, 'image/jpeg', 0.8),
        );

        return blob && blob.size < file.size
            ? new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', {
                  type: 'image/jpeg',
              })
            : file;
    } catch {
        return file;
    }
}

/**
 * "Take photo" opens the phone camera directly; "Upload" picks from the gallery or files.
 */
export function PhotoPickers({
    onPick,
    className,
}: {
    onPick: (file: File) => void;
    className?: string;
}) {
    const change = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = '';

        if (file) {
            onPick(await shrink(file));
        }
    };

    const picker =
        'flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-primary/60 px-3 py-2.5 text-sm font-medium hover:bg-accent focus-within:ring-[3px] focus-within:ring-ring/50';

    return (
        <div className={cn('grid grid-cols-2 gap-2', className)}>
            <label className={picker}>
                <Camera className="size-4" /> Take photo
                <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="sr-only"
                    onChange={change}
                />
            </label>
            <label className={picker}>
                <ImageUp className="size-4" /> Upload
                <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={change}
                />
            </label>
        </div>
    );
}

export function PhotoThumbs({
    photos,
    size = 'md',
}: {
    photos: BillPhoto[];
    size?: 'sm' | 'md';
}) {
    const [open, setOpen] = useState<BillPhoto | null>(null);

    if (photos.length === 0) {
        return null;
    }

    return (
        <>
            <div
                className={cn(
                    size === 'md'
                        ? 'grid grid-cols-3 gap-2 sm:grid-cols-4'
                        : 'flex flex-wrap gap-2',
                )}
            >
                {photos.map((photo) => (
                    <button
                        key={photo.id}
                        type="button"
                        onClick={() => setOpen(photo)}
                        className="text-left"
                    >
                        <img
                            src={show.url(photo.id)}
                            alt={photo.note || 'Bill photo'}
                            loading="lazy"
                            className={cn(
                                'rounded-md bg-muted object-cover',
                                size === 'md'
                                    ? 'aspect-square w-full'
                                    : 'size-12',
                            )}
                        />
                        {size === 'md' && (
                            <span className="mt-1 block truncate text-xs text-muted-foreground">
                                {photo.note ? `${photo.note} · ` : ''}
                                {formatDate(photo.date)}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogTitle>{open?.note || 'Bill photo'}</DialogTitle>
                    <DialogDescription>
                        {open && formatDate(open.date)}
                    </DialogDescription>
                    {open && (
                        <>
                            <img
                                src={show.url(open.id)}
                                alt={open.note || 'Bill photo'}
                                className="max-h-[70vh] w-full rounded-md object-contain"
                            />
                            <Form
                                {...destroy.form(open.id)}
                                options={{ preserveScroll: true }}
                                onBefore={() =>
                                    confirm('Delete this bill photo?')
                                }
                                onSuccess={() => setOpen(null)}
                            >
                                {({ processing }) => (
                                    <Button
                                        type="submit"
                                        variant="destructive"
                                        disabled={processing}
                                    >
                                        <Trash2 /> Delete photo
                                    </Button>
                                )}
                            </Form>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
