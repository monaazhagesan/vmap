<?php

namespace App\Models;

use App\Models\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Carbon;

/**
 * An immediate (petty cash) expense such as diesel, labour or tea.
 *
 * @property int $id
 * @property string $item
 * @property string $amount
 * @property Carbon $date
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['item', 'amount', 'date'])]
class Expense extends Model
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
            'amount' => 'decimal:2',
            'date' => 'date:Y-m-d',
        ];
    }

    /**
     * @return MorphMany<BillPhoto, $this>
     */
    public function photos(): MorphMany
    {
        return $this->morphMany(BillPhoto::class, 'photoable');
    }
}
