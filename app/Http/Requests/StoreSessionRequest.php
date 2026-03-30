<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreSessionRequest extends FormRequest
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
            'language' => 'required|string|max:255',
            'price' => 'required|numeric|min:10',
            'start_time' => 'required|date',
            'type' => 'sometimes|in:normal,VIP',
            'film_id' => 'required|exists:films,id',
            'room_id' => 'required|exists:rooms,id',
        ];
    }
}



