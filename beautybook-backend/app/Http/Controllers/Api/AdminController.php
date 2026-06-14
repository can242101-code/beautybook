<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Consultorio;
use App\Models\Membrecia;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function consultorios(): JsonResponse
    {
        $lista = Consultorio::with(['user', 'membrecia'])->get();
        return response()->json($lista);
    }

    public function showConsultorio(int $id): JsonResponse
    {
        $consultorio = Consultorio::with(['user', 'membrecia', 'tratamientos', 'citas'])->findOrFail($id);
        return response()->json($consultorio);
    }

    public function actualizarMembrecia(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'plan'              => 'required|in:gratuito,basico,premium',
            'dias_vigencia'     => 'required|integer|min:1|max:365',
        ]);

        $limites = ['gratuito' => 20, 'basico' => 100, 'premium' => 9999];

        $membrecia = Membrecia::where('consultorio_id', $id)->firstOrFail();
        $membrecia->update([
            'plan'              => $data['plan'],
            'limite_citas_mes'  => $limites[$data['plan']],
            'fecha_inicio'      => Carbon::today(),
            'fecha_vencimiento' => Carbon::today()->addDays($data['dias_vigencia']),
            'activa'            => true,
        ]);

        return response()->json($membrecia);
    }

    public function activarConsultorio(int $id): JsonResponse
    {
        $consultorio = Consultorio::findOrFail($id);
        $consultorio->update(['activo' => true]);
        $consultorio->membrecia?->update(['activa' => true]);
        return response()->json(['message' => 'Consultorio activado.']);
    }

    public function bloquearConsultorio(int $id): JsonResponse
    {
        $consultorio = Consultorio::findOrFail($id);
        $consultorio->update(['activo' => false]);
        $consultorio->membrecia?->update(['activa' => false]);
        return response()->json(['message' => 'Consultorio bloqueado.']);
    }
}
