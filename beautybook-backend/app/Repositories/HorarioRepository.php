<?php

namespace App\Repositories;

use App\Models\Horario;
use Illuminate\Database\Eloquent\Collection;

class HorarioRepository extends BaseRepository
{
    public function __construct(Horario $model)
    {
        parent::__construct($model);
    }

    public function porConsultorio(int $consultorioId): Collection
    {
        return $this->model
            ->where('consultorio_id', $consultorioId)
            ->where('activo', true)
            ->orderByRaw("ARRAY_POSITION(ARRAY['lunes','martes','miercoles','jueves','viernes','sabado','domingo'], dia_semana)")
            ->get();
    }
}
