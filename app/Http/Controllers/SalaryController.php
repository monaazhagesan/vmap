<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Candidate;
use App\Models\SalaryRole;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Daily-wage salary: roles set the rate per day, candidates hold a role,
 * and attendance records the days each candidate worked.
 */
class SalaryController extends Controller
{
    public function index(Request $request): Response
    {
        $from = $request->date('from')?->toDateString() ?? now()->startOfMonth()->toDateString();
        $to = $request->date('to')?->toDateString() ?? now()->toDateString();

        $entries = Attendance::query()
            ->whereBetween('date', [$from, $to])
            ->orderBy('date')
            ->orderBy('id')
            ->get();

        $candidates = Candidate::query()->with('role')->orderBy('name')->get();

        // Every current candidate appears, plus anyone deleted who still has entries in range.
        $summary = $candidates
            ->mapWithKeys(fn (Candidate $c) => ["c{$c->id}" => [
                'name' => $c->name, 'role' => $c->role->name, 'phone' => $c->phone, 'days' => 0.0, 'amount' => 0.0,
            ]])
            ->all();

        foreach ($entries as $entry) {
            $key = $entry->candidate_id ? "c{$entry->candidate_id}" : "n{$entry->name}";
            $summary[$key] ??= ['name' => $entry->name, 'role' => $entry->role_name, 'phone' => null, 'days' => 0.0, 'amount' => 0.0];
            $summary[$key]['days'] += (float) $entry->days;
            $summary[$key]['amount'] += (float) $entry->days * (float) $entry->rate;
        }

        return Inertia::render('salary/index', [
            'tab' => in_array($request->query('tab'), ['attendance', 'candidates', 'roles'], true) ? $request->query('tab') : 'attendance',
            'roles' => SalaryRole::query()->withCount('candidates')->orderBy('name')->get(),
            'candidates' => $candidates,
            'entries' => $entries,
            'summary' => array_values($summary),
            'filters' => ['from' => $from, 'to' => $to],
            'today' => now()->toDateString(),
        ]);
    }

    public function storeRole(Request $request): RedirectResponse
    {
        SalaryRole::create($this->validatedRole($request));

        return back();
    }

    public function updateRole(Request $request, SalaryRole $role): RedirectResponse
    {
        $role->update($this->validatedRole($request, $role));

        return back();
    }

    public function destroyRole(SalaryRole $role): RedirectResponse
    {
        if ($role->candidates()->exists()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => __('This role is used by a candidate. Change or delete those candidates first.')]);

            return back();
        }

        $role->delete();

        return back();
    }

    public function storeCandidate(Request $request): RedirectResponse
    {
        Candidate::create($this->validatedCandidate($request));

        return back();
    }

    public function updateCandidate(Request $request, Candidate $candidate): RedirectResponse
    {
        $candidate->update($this->validatedCandidate($request));

        return back();
    }

    /**
     * Delete a candidate. Their past salary entries are kept.
     */
    public function destroyCandidate(Candidate $candidate): RedirectResponse
    {
        $candidate->delete();

        return back();
    }

    /**
     * Record days worked, copying the candidate's current role and rate onto the entry.
     */
    public function storeAttendance(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'candidate_id' => ['required', Rule::exists('candidates', 'id')->where('company_id', $request->user()->company_id)],
            'date' => ['required', 'date', 'before_or_equal:today'],
            'days' => ['required', 'numeric', 'gt:0', 'max:31'],
        ], [
            'candidate_id.required' => __('Choose a candidate and enter the days worked.'),
            'days.gt' => __('Choose a candidate and enter the days worked.'),
        ]);

        $candidate = Candidate::with('role')->findOrFail($request->integer('candidate_id'));

        Attendance::create([
            'candidate_id' => $candidate->id,
            'name' => $candidate->name,
            'role_name' => $candidate->role->name,
            'date' => $data['date'],
            'days' => $data['days'],
            'rate' => $candidate->role->daily_rate,
        ]);

        return back();
    }

    public function destroyAttendance(Attendance $attendance): RedirectResponse
    {
        $attendance->delete();

        return back();
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedRole(Request $request, ?SalaryRole $role = null): array
    {
        return $request->validate([
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('salary_roles')->where('company_id', $request->user()->company_id)->ignore($role),
            ],
            'daily_rate' => ['required', 'numeric', 'gt:0', 'max:9999999'],
        ], [
            'name.unique' => __('This role already exists.'),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedCandidate(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'salary_role_id' => ['required', Rule::exists('salary_roles', 'id')->where('company_id', $request->user()->company_id)],
            'phone' => ['nullable', 'string', 'max:30'],
        ]);
    }
}
