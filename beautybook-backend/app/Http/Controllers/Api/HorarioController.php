<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Repositories\HorarioRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HorarioController extends Controller
{
    public function __construct(private HorarioRepository $repo) {}

    public function index(Request $request): JsonResponse
    {
        return response()->json($this->repo->porConsultorio($request->user()->consultorio->id));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'dia_semana'  => 'required|in:lunes,martes,miercoles,jueves,viernes,sabado,domingo',
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fin'    => 'required|date_format:H:i|after:hora_inicio',
        ]);

        $horario = $this->repo->create([
            ...$data,
            'consultorio_id' => $request->user()->consultorio->id,
        ]);

        return response()->json($horario, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'hora_inicio' => 'sometimes|date_format:H:i',
            'hora_fin'    => 'sometimes|date_format:H:i|after:hora_inicio',
            'activo'      => 'sometimes|boolean',
        ]);

        return response()->json($this->repo->update($id, $data));
    }

    public function destroy(int $id): JsonResponse
    {
        $this->repo->delete($id);
        return response()->json(null, 204);
    }
}
