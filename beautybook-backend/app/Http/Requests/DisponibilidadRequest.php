<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * HU03 - Validación de la petición de disponibilidad
 * Desarrollado por: Mirley Madai Gómez Acosta
 */
class DisponibilidadRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'fecha'          => ['required', 'date', 'after_or_equal:today'],
            'tratamiento_id' => ['required', 'integer', 'exists:tratamientos,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'fecha.after_or_equal' => 'La fecha debe ser hoy o posterior.',
            'tratamiento_id.exists' => 'El tratamiento no existe.',
        ];
    }
}
