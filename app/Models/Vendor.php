<?php

namespace App\Models;

use App\Models\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string|null $contact_person
 * @property string|null $phone
 * @property string|null $email
 * @property string|null $place
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'contact_person', 'phone', 'email', 'place', 'is_active'])]
class Vendor extends Model
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
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return HasMany<VendorEntry, $this>
     */
    public function entries(): HasMany
    {
        return $this->hasMany(VendorEntry::class);
    }

    /**
     * @return MorphMany<BillPhoto, $this>
     */
    public function photos(): MorphMany
    {
        return $this->morphMany(BillPhoto::class, 'photoable');
    }

    /**
     * Add purchased_total and paid_total columns from the vendor's ledger.
     *
     * @param  Builder<self>  $query
     */
    public function scopeWithTotals(Builder $query): void
    {
        $query
            ->withSum(['entries as purchased_total' => fn ($q) => $q->where('type', VendorEntry::PURCHASE)], 'amount')
            ->withSum(['entries as paid_total' => fn ($q) => $q->where('type', VendorEntry::PAID)], 'amount');
    }
}
