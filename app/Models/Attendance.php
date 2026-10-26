<?php

namespace App\Models;

use App\Models\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Days worked by a candidate on a date. Salary = days × rate.
 *
 * @property int $id
 * @property int|null $candidate_id
 * @property string $name
 * @property string $role_name
 * @property Carbon $date
 * @property string $days
 * @property string $rate
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['candidate_id', 'name', 'role_name', 'date', 'days', 'rate'])]
class Attendance extends Model
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
            'days' => 'decimal:2',
            'rate' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<Candidate, $this>
     */
    public function candidate(): BelongsTo
    {
        return $this->belongsTo(Candidate::class);
    }
}
