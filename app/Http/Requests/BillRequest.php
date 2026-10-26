<?php

namespace App\Http\Requests;

use App\Models\Bill;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class BillRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'type' => ['required', Rule::in(Bill::TYPES)],
            'date' => ['required', 'date', 'before_or_equal:today'],
            'vehicle_number' => ['required', 'string', 'max:30'],
            'party_name' => ['required', 'string', 'max:255'],
            'material' => ['required', 'string', 'max:255'],
            'gross_weight' => ['required', 'numeric', 'gt:0', 'max:999999999'],
            'vehicle_weight' => ['nullable', 'numeric', 'min:0', 'max:999999999'],
            'rate' => ['required', 'numeric', 'min:0', 'max:9999999999'],
        ];
    }

    /**
     * @return array<int, \Closure(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($this->netWeight() <= 0 && ! $validator->errors()->has('gross_weight')) {
                    $validator->errors()->add('vehicle_weight', __('Gross weight must be more than vehicle weight.'));
                }
            },
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'gross_weight.gt' => __('Enter the weight.'),
        ];
    }

    /**
     * The bill attributes, with net weight and amount worked out.
     *
     * @return array<string, mixed>
     */
    public function billData(): array
    {
        $net = $this->netWeight();
        $rate = (float) $this->input('rate');

        return [
            'type' => $this->input('type'),
            'date' => $this->input('date'),
            'vehicle_number' => strtoupper(trim((string) $this->input('vehicle_number'))),
            'party_name' => trim((string) $this->input('party_name')),
            'material' => $this->input('material'),
            'gross_weight' => (float) $this->input('gross_weight'),
            'vehicle_weight' => (float) $this->input('vehicle_weight'),
            'net_weight' => $net,
            'rate' => $rate,
            'amount' => round($net * $rate, 2),
        ];
    }

    private function netWeight(): float
    {
        return round((float) $this->input('gross_weight') - (float) $this->input('vehicle_weight'), 3);
    }
}
