<?php

namespace Tests\Feature;

use App\Models\Bill;
use App\Models\Candidate;
use App\Models\Company;
use App\Models\SalaryRole;
use App\Models\User;
use App\Models\Vendor;
use App\Support\ActivationCodes;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ScrapYardTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_creates_a_company_on_a_free_trial_with_default_materials()
    {
        $this->post(route('register.store'), [
            'name' => 'Mona',
            'company_name' => 'Mona Scrap Traders',
            'phone' => '9840011122',
            'email' => 'mona@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])->assertRedirect(route('dashboard', absolute: false));

        $user = User::where('email', 'mona@example.com')->sole();
        $this->assertTrue($user->isOwner());
        $this->assertSame('Mona Scrap Traders', $user->company->name);
        $this->assertSame('Free trial', $user->company->plan);
        $this->assertTrue($user->company->subscriptionActive());
        $this->assertSame(4, $user->company->materials()->count());

        $this->get(route('dashboard'))->assertOk();
    }

    public function test_a_weighment_bill_works_out_net_weight_amount_and_bill_number()
    {
        $this->actingAs(User::factory()->create());

        $bill = ['type' => 'purchase', 'date' => now()->toDateString(), 'vehicle_number' => 'tn 59 ab 1234',
            'party_name' => 'Ravi Traders', 'material' => 'Cast iron', 'gross_weight' => '8500', 'vehicle_weight' => '2300', 'rate' => '32.5'];

        $this->post(route('bills.store'), $bill)->assertRedirect(route('bills.index', 'purchase'));
        $this->post(route('bills.store'), $bill);

        $first = Bill::orderBy('id')->first();
        $this->assertSame('P-0001', $first->bill_no);
        $this->assertSame('TN 59 AB 1234', $first->vehicle_number);
        $this->assertSame('6200.000', $first->net_weight);
        $this->assertSame('201500.00', $first->amount);
        $this->assertSame('P-0002', Bill::orderByDesc('id')->first()->bill_no);
    }

    public function test_vehicle_weight_cannot_exceed_gross_weight()
    {
        $this->actingAs(User::factory()->create());

        $this->post(route('bills.store'), [
            'type' => 'sales', 'date' => now()->toDateString(), 'vehicle_number' => 'TN 01 X 1', 'party_name' => 'Mill',
            'material' => 'Cast iron', 'gross_weight' => '1000', 'vehicle_weight' => '1200', 'rate' => '30',
        ])->assertSessionHasErrors('vehicle_weight');

        $this->assertSame(0, Bill::count());
    }

    public function test_companies_cannot_see_each_others_data()
    {
        $other = User::factory()->create();
        $this->actingAs($other);
        $vendor = Vendor::create(['name' => 'Secret Vendor', 'is_active' => true]);

        $this->actingAs(User::factory()->create());

        $this->get(route('vendors.show', $vendor))->assertNotFound();
        $this->get(route('vendors.index'))->assertDontSee('Secret Vendor');
        $this->put(route('vendors.update', $vendor), ['name' => 'Hacked', 'is_active' => true])->assertNotFound();
        $this->assertSame('Secret Vendor', $vendor->fresh()->name);
    }

    public function test_admins_cannot_open_owner_pages()
    {
        $owner = User::factory()->create();
        $admin = User::factory()->adminOf($owner->company)->create();
        $this->actingAs($admin);

        $this->get(route('bills.create'))->assertOk();
        $this->get(route('vendors.index'))->assertOk();
        $this->get(route('expenses.index'))->assertOk();

        foreach (['dashboard', 'salary.index', 'reports.index', 'subscription.show', 'company.edit', 'users.index'] as $route) {
            $this->get(route($route))->assertRedirect(route('bills.index', 'purchase'));
        }
    }

    public function test_an_expired_plan_sends_the_owner_to_renew_and_blocks_admins()
    {
        $owner = User::factory()->create();
        $owner->company->update(['subscription_expires_at' => now()->subMinute()]);
        $admin = User::factory()->adminOf($owner->company)->create();

        $this->actingAs($owner)->get(route('bills.create'))->assertRedirect(route('subscription.show'));
        $this->actingAs($owner)->get(route('subscription.show'))->assertOk();
        $this->actingAs($admin)->get(route('bills.create'))
            ->assertInertia(fn ($page) => $page->component('subscription/expired'));
    }

    public function test_an_activation_code_extends_the_plan_once()
    {
        $owner = User::factory()->create();
        $owner->company->update(['subscription_expires_at' => now()->subDay(), 'plan' => 'Free trial']);
        $code = ActivationCodes::generate(30);

        $this->actingAs($owner)->post(route('subscription.activate'), ['code' => strtolower($code)])->assertSessionHasNoErrors();

        $company = $owner->company->fresh();
        $this->assertSame('Monthly', $company->plan);
        $this->assertTrue($company->subscription_expires_at->between(now()->addDays(30)->subMinute(), now()->addDays(30)->addMinute()));

        $this->post(route('subscription.activate'), ['code' => $code])->assertSessionHasErrors(['code' => 'This code was already used.']);
        $this->post(route('subscription.activate'), ['code' => 'VM-030-ABCDE-00000'])->assertSessionHasErrors(['code' => 'Invalid activation code.']);
    }

    public function test_activation_codes_match_the_original_web_app()
    {
        config(['vmap.activation_secret' => 'test-only-secret']);

        // Generated by the original JavaScript implementation with the same secret.
        $this->assertSame(30, ActivationCodes::days('VM-030-ABCDE-VJA68'));
        $this->assertSame(365, ActivationCodes::days('VM-365-ZZZZZ-B2MTI'));
        $this->assertSame(7, ActivationCodes::days('VM-007-QWERT-5ZCB9'));
        $this->assertNull(ActivationCodes::days('VM-030-ABCDE-VJA69'));
    }

    public function test_no_code_is_accepted_without_a_secret()
    {
        config(['vmap.activation_secret' => 'test-only-secret']);
        $code = ActivationCodes::generate(30);

        config(['vmap.activation_secret' => null]);

        $this->assertNull(ActivationCodes::days($code));
    }

    public function test_vendor_ledger_tracks_the_balance()
    {
        $this->actingAs(User::factory()->create());
        $vendor = Vendor::create(['name' => 'Ravi', 'is_active' => true]);

        $this->post(route('vendors.entries.store', $vendor), ['type' => 'purchase', 'amount' => '50000', 'date' => now()->toDateString()]);
        $this->post(route('vendors.entries.store', $vendor), ['type' => 'paid', 'amount' => '30000', 'date' => now()->toDateString()]);

        $this->get(route('vendors.show', $vendor))->assertInertia(fn ($page) => $page
            ->where('vendor.purchased_total', fn ($total) => (float) $total === 50000.0)
            ->where('vendor.paid_total', fn ($total) => (float) $total === 30000.0)
            ->where('ledger.1.balance', 20000));
    }

    public function test_bill_photos_are_private_to_the_company()
    {
        Storage::fake();
        $this->actingAs(User::factory()->create());
        $vendor = Vendor::create(['name' => 'Ravi', 'is_active' => true]);

        // A real 1×1 PNG, so the test doesn't need the GD extension.
        $png = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
        $this->post(route('vendors.photos.store', $vendor), [
            'photo' => UploadedFile::fake()->createWithContent('bill.png', $png),
            'note' => 'Bill 12',
        ])->assertSessionHasNoErrors();
        $photo = $vendor->photos()->sole();

        $this->get(route('photos.show', $photo))->assertOk();

        $this->actingAs(User::factory()->create())->get(route('photos.show', $photo))->assertNotFound();
    }

    public function test_salary_entries_keep_the_rate_they_were_paid_at()
    {
        $this->actingAs(User::factory()->create());

        $this->post(route('salary.roles.store'), ['name' => 'Driver', 'daily_rate' => '900']);
        $role = SalaryRole::sole();
        $this->post(route('salary.candidates.store'), ['name' => 'Kumar', 'salary_role_id' => $role->id]);
        $candidate = Candidate::sole();
        $this->post(route('salary.attendance.store'), ['candidate_id' => $candidate->id, 'date' => now()->toDateString(), 'days' => '1.5']);

        $this->put(route('salary.roles.update', $role), ['name' => 'Driver', 'daily_rate' => '1000']);

        $this->get(route('salary.index'))->assertInertia(fn ($page) => $page
            ->where('summary.0.days', 1.5)
            ->where('summary.0.amount', 1350));
    }

    public function test_dashboard_and_reports_add_up_profit()
    {
        $owner = User::factory()->create();
        $this->actingAs($owner);
        $today = now()->toDateString();

        foreach ([['purchase', 1000, 30], ['sales', 1000, 40]] as [$type, $kg, $rate]) {
            $this->post(route('bills.store'), ['type' => $type, 'date' => $today, 'vehicle_number' => 'TN 1', 'party_name' => 'X',
                'material' => 'Cast iron', 'gross_weight' => $kg, 'rate' => $rate]);
        }
        $this->post(route('expenses.store'), ['item' => 'Diesel', 'amount' => '500', 'date' => $today]);

        $this->get(route('dashboard'))->assertInertia(fn ($page) => $page
            ->where('totals.sales', 40000)
            ->where('totals.purchases', 30000)
            ->where('totals.expenses', 500)
            ->where('totals.net', 9500));

        foreach (['purchase', 'sales', 'expense', 'immediate'] as $report) {
            $this->get(route('reports.show', ['report' => $report, 'group' => 'month']))->assertOk();
        }

        $this->get(route('reports.show', 'expense'))->assertInertia(fn ($page) => $page->where('totals', ['30,000', '500', '0', '30,500']));
    }

    public function test_owner_deleting_their_account_removes_the_company()
    {
        $owner = User::factory()->create();
        $company = $owner->company;
        User::factory()->adminOf($company)->create();

        $this->actingAs($owner)->delete(route('profile.destroy'), ['password' => 'password'])->assertRedirect('/');

        $this->assertNull(Company::find($company->id));
        $this->assertSame(0, User::where('company_id', $company->id)->count());
    }
}
