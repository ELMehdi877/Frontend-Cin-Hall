<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreRoomRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'type' => 'required|in:normal,VIP',
            'capacity' => 'required|integer|min:1',
            'couple_seats' => 'nullable|array',
            'couple_seats.*' => 'integer|min:1|max:' . ($this->capacity),
            'seat_adjacent' => 'nullable|array',
            'seat_adjacent.*' => 'integer|min:1|max:' . ($this->capacity),
        ];
    }
}
