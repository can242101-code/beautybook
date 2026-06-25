<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use App\Models\Cita;

/**
 * HU05 - Cancelación de cita con justificación
 * Desarrollado por: Mirley Madai Gómez Acosta
 */
class CancelacionController extends Controller
{
    public function cancelar(Request $request, int $citaId): JsonResponse
    {
        $request->validate([
            'motivo' => 'required|string|max:500',
        ]);

        $cita = Cita::where('paciente_id', auth()->id())
                    ->where('estado', 'confirmada')
                    ->findOrFail($citaId);

        // No se puede cancelar con menos de 24h de anticipación
        if (now()->diffInHours($cita->fecha_hora) < 24) {
            return response()->json([
                'message' => 'No es posible cancelar con menos de 24 horas de anticipación.',
            ], 422);
        }

        $cita->update(['estado' => 'cancelada', 'motivo_cancelacion' => $request->motivo]);

        return response()->json(['message' => 'Cita cancelada exitosamente.']);
    }
}
