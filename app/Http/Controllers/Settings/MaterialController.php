<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Material;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class MaterialController extends Controller
{
    /**
     * The materials offered in the weighment form.
     */
    public function index(): Response
    {
        return Inertia::render('settings/materials', [
            'materials' => Material::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Material::create($request->validate([
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('materials')->where('company_id', $request->user()->company_id),
            ],
        ], [
            'name.unique' => __('This material already exists.'),
        ]));

        return back();
    }

    /**
     * Remove a material. Bills that used it keep its name.
     */
    public function destroy(Material $material): RedirectResponse
    {
        $material->delete();

        return back();
    }
}
