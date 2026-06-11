<?php

namespace App\Repositories;

use App\Models\Consultorio;
use Illuminate\Database\Eloquent\Collection;

class ConsultorioRepository extends BaseRepository
{
    public function __construct(Consultorio $model)
    {
        parent::__construct($model);
    }

    public function porCiudad(string $ciudad): Collection
    {
        return $this->model
            ->where('activo', true)
            ->where('ciudad', 'ilike', "%{$ciudad}%")
            ->with(['tratamientos' => fn($q) => $q->where('activo', true), 'membrecia'])
            ->get();
    }

    public function porUsuario(int $userId): ?Consultorio
    {
        return $this->model->where('user_id', $userId)->with(['tratamientos', 'horarios', 'membrecia'])->first();
    }
}
