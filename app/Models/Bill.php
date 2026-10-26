<?php

namespace App\Models;

use App\Models\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * A weighment bill: one material bought from a vendor or sold to a customer.
 *
 * @property int $id
 * @property int|null $user_id
 * @property string $type
 * @property string $bill_no
 * @property Carbon $date
 * @property string $vehicle_number
 * @property string $party_name
 * @property string $material
 * @property string $gross_weight
 * @property string $vehicle_weight
 * @property string $net_weight
 * @property string $rate
 * @property string $amount
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['type', 'bill_no', 'date', 'vehicle_number', 'party_name', 'material', 'gross_weight', 'vehicle_weight', 'net_weight', 'rate', 'amount'])]
class Bill extends Model
{
    use BelongsToCompany;

    public const PURCHASE = 'purchase';

    public const SALES = 'sales';

    public const TYPES = [self::PURCHASE, self::SALES];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date' => 'date:Y-m-d',
            'gross_weight' => 'decimal:3',
            'vehicle_weight' => 'decimal:3',
            'net_weight' => 'decimal:3',
            'rate' => 'decimal:2',
            'amount' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
