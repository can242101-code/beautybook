<?php

namespace App\Repositories;

use App\Models\Cita;
use Illuminate\Database\Eloquent\Collection;

class CitaRepository extends BaseRepository
{
    public function __construct(Cita $model)
    {
        parent::__construct($model);
    }

    public function porConsultorioFecha(int $consultorioId, string $fecha, array $estados = ['pendiente', 'confirmada']): Collection
    {
        return $this->model
            ->where('consultorio_id', $consultorioId)
            ->where('fecha', $fecha)
            ->when(!empty($estados), fn($q) => $q->whereIn('estado', $estados))
            ->with(['paciente.user', 'tratamiento'])
            ->orderBy('hora_inicio')
            ->get();
    }

    public function porPaciente(int $pacienteId): Collection
    {
        return $this->model
            ->where('paciente_id', $pacienteId)
            ->with(['consultorio', 'tratamiento'])
            ->orderBy('fecha', 'desc')
            ->get();
    }

    public function hayConflicto(int $consultorioId, string $fecha, string $horaInicio, string $horaFin, ?int $exceptoId = null): bool
    {
        $query = $this->model
            ->where('consultorio_id', $consultorioId)
            ->where('fecha', $fecha)
            ->whereIn('estado', ['pendiente', 'confirmada'])
            ->where(function ($q) use ($horaInicio, $horaFin) {
                $q->whereBetween('hora_inicio', [$horaInicio, $horaFin])
                  ->orWhereBetween('hora_fin', [$horaInicio, $horaFin])
                  ->orWhere(fn($q2) => $q2->where('hora_inicio', '<=', $horaInicio)->where('hora_fin', '>=', $horaFin));
            });

        if ($exceptoId) {
            $query->where('id', '!=', $exceptoId);
        }

        return $query->exists();
    }
}
