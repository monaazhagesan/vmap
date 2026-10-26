<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * A subscription activation code that has been redeemed. Codes are single-use across all companies.
 *
 * @property int $id
 * @property int $company_id
 * @property string $code
 * @property int $days
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['code', 'days'])]
class ActivationCode extends Model
{
    //
}
