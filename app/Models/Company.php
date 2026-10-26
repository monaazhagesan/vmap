<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string|null $registration_number
 * @property string|null $address
 * @property string|null $phone
 * @property bool $sales_vehicle_weight
 * @property string $plan
 * @property Carbon|null $subscription_expires_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'registration_number', 'address', 'phone', 'sales_vehicle_weight', 'plan', 'subscription_expires_at'])]
class Company extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'sales_vehicle_weight' => 'boolean',
            'subscription_expires_at' => 'datetime',
        ];
    }

    public function subscriptionActive(): bool
    {
        return $this->subscription_expires_at?->isFuture() ?? false;
    }

    /**
     * @return HasMany<User, $this>
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * @return HasMany<Material, $this>
     */
    public function materials(): HasMany
    {
        return $this->hasMany(Material::class);
    }

    /**
     * @return HasMany<ActivationCode, $this>
     */
    public function activationCodes(): HasMany
    {
        return $this->hasMany(ActivationCode::class);
    }
}
