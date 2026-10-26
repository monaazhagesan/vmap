<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\Company;
use App\Models\Material;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Register a new company with its owner, starting the free trial.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'company_name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'password' => $this->passwordRules(),
        ])->validate();

        return DB::transaction(function () use ($input) {
            $trialDays = config('vmap.trial_days');

            $company = Company::create([
                'name' => $input['company_name'],
                'phone' => $input['phone'] ?? null,
                'plan' => $trialDays > 0 ? 'Free trial' : 'None',
                'subscription_expires_at' => now()->addDays($trialDays),
            ]);

            $company->materials()->createMany(
                array_map(fn (string $name) => ['name' => $name], Material::DEFAULTS),
            );

            $user = new User([
                'name' => $input['name'],
                'email' => $input['email'],
                'password' => $input['password'],
            ]);
            $user->company_id = $company->id;
            $user->role = User::OWNER;
            $user->save();

            return $user;
        });
    }
}
