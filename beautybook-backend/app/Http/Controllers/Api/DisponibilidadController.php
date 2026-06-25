<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use App\Models\Consultorio;

/**
 * HU03 - Disponibilidad de horarios en tiempo real
 * Desarrollado por: Mirley Madai Gómez Acosta
 */
class DisponibilidadController extends Controller
{
    /**
     * Retorna los horarios disponibles del consultorio para una fecha dada.
     * Usa caché Redis/Memurai con TTL de 60 segundos para respuesta en tiempo real.
     */
    public function horarios(Request $request, int $consultorioId): JsonResponse
    {
        $request->validate([
            'fecha'          => 'required|date|after_or_equal:today',
            'tratamiento_id' => 'required|exists:tratamientos,id',
        ]);

        $cacheKey = "disponibilidad:{$consultorioId}:{$request->fecha}:{$request->tratamiento_id}";

        $slots = cache()->remember($cacheKey, 60, function () use ($request, $consultorioId) {
            $consultorio = Consultorio::with('horarios', 'citas')->findOrFail($consultorioId);
            return $consultorio->calcularSlotsDisponibles(
                $request->fecha,
                $request->tratamiento_id
            );
        });

        return response()->json([
            'fecha'       => $request->fecha,
            'disponibles' => $slots,
        ]);
    }
}
