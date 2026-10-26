<?php

namespace App\Models;

use App\Models\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * A worker paid a daily wage according to their role.
 *
 * @property int $id
 * @property int $salary_role_id
 * @property string $name
 * @property string|null $phone
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['salary_role_id', 'name', 'phone'])]
class Candidate extends Model
{
    use BelongsToCompany;

    /**
     * @return BelongsTo<SalaryRole, $this>
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(SalaryRole::class, 'salary_role_id');
    }

    /**
     * @return HasMany<Attendance, $this>
     */
    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }
}
