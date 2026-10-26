<?php

namespace App\Models\Concerns;

use App\Models\Company;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;

/**
 * Scopes a model to the signed-in user's company and fills company_id on create.
 *
 * @property int $company_id
 */
trait BelongsToCompany
{
    public static function bootBelongsToCompany(): void
    {
        static::addGlobalScope('company', function (Builder $query) {
            $companyId = Auth::user()?->company_id;

            if ($companyId !== null) {
                $query->where($query->qualifyColumn('company_id'), $companyId);
            }
        });

        static::creating(function (self $model) {
            $model->company_id ??= Auth::user()?->company_id;
        });
    }

    /**
     * @return BelongsTo<Company, $this>
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
