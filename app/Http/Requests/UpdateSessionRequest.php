<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateSessionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'language' => 'sometimes|string|max:255',
            'price' => 'sometimes|numeric|min:10',
            'start_time' => 'sometimes|date',
            'type' => 'sometimes|in:normal,VIP',
            'film_id' => 'sometimes|exists:films,id',
            'room_id' => 'sometimes|exists:rooms,id',
        ];
    }
}
