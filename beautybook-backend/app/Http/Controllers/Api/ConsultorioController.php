<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Repositories\ConsultorioRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConsultorioController extends Controller
{
    public function __construct(private ConsultorioRepository $repo) {}

    public function index(Request $request): JsonResponse
    {
        $ciudad = $request->query('ciudad', '');
        $lista  = $ciudad
            ? $this->repo->porCiudad($ciudad)
            : $this->repo->all(['tratamientos', 'membrecia']);

        return response()->json($lista);
    }

    public function show(int $id): JsonResponse
    {
        $consultorio = $this->repo->find($id, ['tratamientos', 'horarios', 'membrecia']);
        abort_unless($consultorio, 404);
        return response()->json($consultorio);
    }

    public function update(Request $request): JsonResponse
    {
        $consultorio = $request->user()->consultorio;
        abort_unless($consultorio, 404);

        $data = $request->validate([
            'nombre'      => 'sometimes|string|max:255',
            'direccion'   => 'sometimes|string',
            'ciudad'      => 'sometimes|string|max:100',
            'telefono'    => 'sometimes|string|max:20',
            'descripcion' => 'nullable|string',
        ]);

        $consultorio->update($data);
        return response()->json($consultorio->fresh(['tratamientos', 'horarios', 'membrecia']));
    }
}
