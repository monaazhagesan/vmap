<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\Bill;
use App\Models\Candidate;
use App\Models\Company;
use App\Models\Expense;
use App\Models\Material;
use App\Models\SalaryRole;
use App\Models\User;
use App\Models\Vendor;
use App\Models\VendorEntry;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Auth;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed a demo scrap yard with an owner, an admin and two months of activity.
     */
    public function run(): void
    {
        $company = Company::create([
            'name' => 'Vmap Demo Scrap Yard',
            'registration_number' => '33AABCV1234F1Z5',
            'address' => "12, Industrial Estate Road\nGuindy, Chennai 600032",
            'phone' => '98400 12345',
            'plan' => 'Yearly',
            'subscription_expires_at' => now()->addYear(),
        ]);

        $owner = User::factory()->create([
            'company_id' => $company->id,
            'name' => 'Owner',
            'email' => 'admin@vmapscrap.test',
        ]);

        User::factory()->adminOf($company)->create([
            'name' => 'Yard Admin',
            'email' => 'yard@vmapscrap.test',
        ]);

        // Company-scoped models fill company_id from the signed-in user.
        Auth::login($owner);

        foreach (Material::DEFAULTS as $name) {
            Material::create(['name' => $name]);
        }

        $vendors = collect([
            ['Ravi Kabadi Traders', 'Ravi', '9840011122', 'Tambaram'],
            ['Sri Murugan Scrap', 'Murugan', '9884033344', 'Ambattur'],
            ['Chennai Demolition Works', 'Suresh', '9003055566', 'Guindy'],
        ])->map(fn ($v) => Vendor::create([
            'name' => $v[0], 'contact_person' => $v[1], 'phone' => $v[2], 'place' => $v[3], 'is_active' => true,
        ]));
        $customers = ['Tamil Nadu Steel Mills', 'Southern Foundry'];
        $rates = ['Heavy melting scrap' => [32, 38], 'Iron turnings' => [24, 29], 'Cast iron' => [28, 34], 'Mixed iron' => [26, 31]];

        $roles = collect([['Driver', 900], ['Labour', 650], ['Supervisor', 1200]])
            ->map(fn ($r) => SalaryRole::create(['name' => $r[0], 'daily_rate' => $r[1]]));
        $candidates = collect([['Kumar', 0], ['Selvam', 1], ['Arjun', 1], ['Prakash', 2]])
            ->map(fn ($c) => Candidate::create(['name' => $c[0], 'salary_role_id' => $roles[$c[1]]->id, 'phone' => '9'.random_int(100000000, 999999999)]));

        $seq = [Bill::PURCHASE => 0, Bill::SALES => 0];

        for ($daysAgo = 59; $daysAgo >= 0; $daysAgo--) {
            $date = now()->subDays($daysAgo)->toDateString();

            if (now()->subDays($daysAgo)->isSunday()) {
                continue;
            }

            foreach (range(1, random_int(1, 3)) as $_) {
                $material = array_rand($rates);
                $vendor = $vendors->random();
                $gross = random_int(3000, 12000);
                $tare = random_int(1500, 2500);
                $this->bill(Bill::PURCHASE, ++$seq[Bill::PURCHASE], $date, $vendor->name, $material, $gross, $tare, $rates[$material][0]);
                $vendor->entries()->create(['type' => VendorEntry::PURCHASE, 'amount' => ($gross - $tare) * $rates[$material][0], 'date' => $date]);
            }

            if ($daysAgo % 2 === 0) {
                $material = array_rand($rates);
                $this->bill(Bill::SALES, ++$seq[Bill::SALES], $date, $customers[array_rand($customers)], $material, random_int(15000, 30000), 0, $rates[$material][1]);
            }

            if ($daysAgo % 5 === 0) {
                foreach ($vendors as $vendor) {
                    $owed = (float) $vendor->entries()->where('type', VendorEntry::PURCHASE)->sum('amount')
                        - (float) $vendor->entries()->where('type', VendorEntry::PAID)->sum('amount');
                    if ($owed > 0) {
                        $vendor->entries()->create(['type' => VendorEntry::PAID, 'amount' => round($owed * 0.8, -2), 'date' => $date]);
                    }
                }
            }

            Expense::create(['item' => collect(['Diesel', 'Tea & snacks', 'Loading labour', 'Weighbridge fee'])->random(), 'amount' => random_int(2, 30) * 50, 'date' => $date]);

            foreach ($candidates as $candidate) {
                Attendance::create([
                    'candidate_id' => $candidate->id,
                    'name' => $candidate->name,
                    'role_name' => $candidate->role->name,
                    'date' => $date,
                    'days' => 1,
                    'rate' => $candidate->role->daily_rate,
                ]);
            }
        }

        Auth::logout();
    }

    private function bill(string $type, int $seq, string $date, string $party, string $material, int $gross, int $tare, float $rate): void
    {
        $net = $gross - $tare;

        Bill::create([
            'type' => $type,
            'bill_no' => ($type === Bill::SALES ? 'S-' : 'P-').str_pad((string) $seq, 4, '0', STR_PAD_LEFT),
            'date' => $date,
            'vehicle_number' => 'TN '.random_int(1, 99).' '.chr(random_int(65, 90)).chr(random_int(65, 90)).' '.random_int(1000, 9999),
            'party_name' => $party,
            'material' => $material,
            'gross_weight' => $gross,
            'vehicle_weight' => $tare,
            'net_weight' => $net,
            'rate' => $rate,
            'amount' => $net * $rate,
        ]);
    }
}
