<?php

namespace App\Models;

use App\Models\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

/**
 * A photo of a paper bill, attached to a vendor or an expense.
 * Files live on the private disk and are served through BillPhotoController.
 *
 * @property int $id
 * @property string $photoable_type
 * @property int $photoable_id
 * @property string $path
 * @property string|null $note
 * @property Carbon $date
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['path', 'note', 'date'])]
#[Hidden(['path'])]
class BillPhoto extends Model
{
    use BelongsToCompany;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date' => 'date:Y-m-d',
        ];
    }

    protected static function booted(): void
    {
        static::deleted(fn (BillPhoto $photo) => Storage::delete($photo->path));
    }

    /**
     * @return MorphTo<Model, $this>
     */
    public function photoable(): MorphTo
    {
        return $this->morphTo();
    }
}
