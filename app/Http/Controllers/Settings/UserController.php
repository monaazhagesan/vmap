<?php

namespace App\Http\Controllers\Settings;

use App\Concerns\PasswordValidationRules;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The owner adds admins (who can use bills, vendors and expenses only) and sets passwords.
 */
class UserController extends Controller
{
    use PasswordValidationRules;

    public function index(Request $request): Response
    {
        return Inertia::render('settings/users', [
            'users' => $this->companyUsers($request)->orderByDesc('role')->orderBy('name')->get(['id', 'name', 'email', 'role']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
            'password' => $this->passwordRules(),
        ]);

        $user = new User($data);
        $user->company_id = $request->user()->company_id;
        $user->role = User::ADMIN;
        $user->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Admin created.')]);

        return back();
    }

    /**
     * Set a new password for any user in the company.
     */
    public function updatePassword(Request $request, int $user): RedirectResponse
    {
        $target = $this->companyUsers($request)->findOrFail($user);

        $target->update($request->validate(['password' => $this->passwordRules()]));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Password updated for :name.', ['name' => $target->name])]);

        return back();
    }

    /**
     * Remove an admin. The owner can't be removed here.
     */
    public function destroy(Request $request, int $user): RedirectResponse
    {
        $target = $this->companyUsers($request)->where('role', User::ADMIN)->findOrFail($user);
        $target->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Admin removed.')]);

        return back();
    }

    /**
     * @return Builder<User>
     */
    private function companyUsers(Request $request): Builder
    {
        return User::query()->where('company_id', $request->user()->company_id);
    }
}
