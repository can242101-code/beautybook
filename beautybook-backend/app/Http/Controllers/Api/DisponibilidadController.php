<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Repositories\CitaRepository;
use App\Repositories\HorarioRepository;
use App\Repositories\TratamientoRepository;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class DisponibilidadController extends Controller
{
    public function __construct(
        private CitaRepository $citas,
        private HorarioRepository $horarios,
        private TratamientoRepository $tratamientos
    ) {}

    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'consultorio_id'  => 'required|integer|exists:consultorios,id',
            'tratamiento_id'  => 'required|integer|exists:tratamientos,id',
            'fecha'           => 'required|date|after_or_equal:today',
        ]);

        $cacheKey = "disponibilidad:{$request->consultorio_id}:{$request->tratamiento_id}:{$request->fecha}";

        $slots = Cache::remember($cacheKey, 300, function () use ($request) {
            return $this->calcularSlots(
                (int) $request->consultorio_id,
                (int) $request->tratamiento_id,
                $request->fecha
            );
        });

        return response()->json(['slots' => $slots]);
    }

    private function calcularSlots(int $consultorioId, int $tratamientoId, string $fecha): array
    {
        $tratamiento = $this->tratamientos->find($tratamientoId);
        $diaSemana   = strtolower(Carbon::parse($fecha)->locale('es')->isoFormat('dddd'));
        $diaSemana   = str_replace(['lunes','martes','miércoles','jueves','viernes','sábado','domingo'],
                                    ['lunes','martes','miercoles','jueves','viernes','sabado','domingo'], $diaSemana);

        $horario = $this->horarios->porConsultorio($consultorioId)
            ->firstWhere('dia_semana', $diaSemana);

        if (!$horario || !$tratamiento) {
            return [];
        }

        $citasOcupadas = $this->citas->porConsultorioFecha($consultorioId, $fecha);
        $duracion      = $tratamiento->duracion_minutos;
        $inicio        = Carbon::parse("{$fecha} {$horario->hora_inicio}");
        $fin           = Carbon::parse("{$fecha} {$horario->hora_fin}");
        $slots         = [];

        while ($inicio->copy()->addMinutes($duracion)->lte($fin)) {
            $horaSlot   = $inicio->format('H:i');
            $finSlot    = $inicio->copy()->addMinutes($duracion)->format('H:i');
            $ocupado    = $citasOcupadas->first(
                fn($c) => $c->hora_inicio < $finSlot && $c->hora_fin > $horaSlot
            );

            $slots[] = [
                'hora_inicio' => $horaSlot,
                'hora_fin'    => $finSlot,
                'disponible'  => !$ocupado,
            ];

            $inicio->addMinutes($duracion);
        }

        return $slots;
    }
}
