<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Repositories\CitaRepository;
use App\Repositories\TratamientoRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CitaController extends Controller
{
    public function __construct(
        private CitaRepository $citas,
        private TratamientoRepository $tratamientos
    ) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $lista = match ($user->role) {
            'paciente'     => $this->citas->porPaciente($user->paciente->id),
            'consultorio'  => $this->citas->porConsultorioFecha($user->consultorio->id, now()->toDateString(), ['pendiente', 'confirmada', 'completada']),
            default        => collect(),
        };

        return response()->json($lista);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'consultorio_id'  => 'required|exists:consultorios,id',
            'tratamiento_id'  => 'required|exists:tratamientos,id',
            'fecha'           => 'required|date|after_or_equal:today',
            'hora_inicio'     => 'required|date_format:H:i',
            'notas'           => 'nullable|string|max:500',
        ]);

        $tratamiento = $this->tratamientos->find((int) $data['tratamiento_id']);
        $horaFin     = \Carbon\Carbon::parse($data['hora_inicio'])
                        ->addMinutes($tratamiento->duracion_minutos)
                        ->format('H:i');

        if ($this->citas->hayConflicto($data['consultorio_id'], $data['fecha'], $data['hora_inicio'], $horaFin)) {
            return response()->json(['message' => 'El horario ya está ocupado. Elige otro disponible.'], 422);
        }

        $pacienteId = $request->user()->paciente->id;

        $cita = $this->citas->create([
            ...$data,
            'paciente_id' => $pacienteId,
            'hora_fin'    => $horaFin,
            'estado'      => 'pendiente',
        ]);

        $this->limpiarCacheDisponibilidad($data['consultorio_id'], $data['tratamiento_id'], $data['fecha']);

        return response()->json($cita->load(['paciente.user', 'consultorio', 'tratamiento']), 201);
    }

    public function show(int $id): JsonResponse
    {
        $cita = $this->citas->find($id, ['paciente.user', 'consultorio', 'tratamiento']);
        abort_unless($cita, 404);
        return response()->json($cita);
    }

    public function cancelar(Request $request, int $id): JsonResponse
    {
        $cita = $this->citas->find($id);
        abort_unless($cita, 404);

        if ($cita->estado === 'cancelada') {
            return response()->json(['message' => 'La cita ya estaba cancelada.'], 422);
        }

        $cita->cancelar();
        $this->limpiarCacheDisponibilidad($cita->consultorio_id, $cita->tratamiento_id, $cita->fecha->toDateString());

        return response()->json(['message' => 'Cita cancelada correctamente.']);
    }

    public function actualizarEstado(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'estado' => 'required|in:confirmada,completada',
        ]);

        $consultorioId = $request->user()->consultorio->id;
        $cita          = $this->citas->find($id, ['paciente.user', 'consultorio', 'tratamiento']);

        abort_unless($cita && $cita->consultorio_id === $consultorioId, 404);

        $transiciones = ['pendiente' => 'confirmada', 'confirmada' => 'completada'];
        if (($transiciones[$cita->estado] ?? null) !== $data['estado']) {
            return response()->json(['message' => 'Transición de estado no permitida.'], 422);
        }

        $cita->update(['estado' => $data['estado']]);

        return response()->json($cita->fresh(['paciente.user', 'consultorio', 'tratamiento']));
    }

    private function limpiarCacheDisponibilidad(int $consultorioId, int $tratamientoId, string $fecha): void
    {
        Cache::forget("disponibilidad:{$consultorioId}:{$tratamientoId}:{$fecha}");
    }
}
