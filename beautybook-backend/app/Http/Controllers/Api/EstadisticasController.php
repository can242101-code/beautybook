<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cita;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EstadisticasController extends Controller
{
    public function estadisticas(Request $request): JsonResponse
    {
        $id = $request->user()->consultorio->id;

        $topTratamientos = DB::table('citas')
            ->join('tratamientos', 'citas.tratamiento_id', '=', 'tratamientos.id')
            ->where('citas.consultorio_id', $id)
            ->whereIn('citas.estado', ['confirmada', 'completada'])
            ->groupBy('tratamientos.id', 'tratamientos.nombre')
            ->orderByDesc('total')
            ->limit(5)
            ->select('tratamientos.nombre', DB::raw('count(*) as total'))
            ->get();

        $citasMes = Cita::where('consultorio_id', $id)
            ->whereYear('fecha', now()->year)->whereMonth('fecha', now()->month)
            ->whereIn('estado', ['pendiente', 'confirmada', 'completada'])
            ->count();

        $totalGeneral    = Cita::where('consultorio_id', $id)->whereIn('estado', ['confirmada', 'completada'])->count();
        $pacientesUnicos = Cita::where('consultorio_id', $id)->whereIn('estado', ['confirmada', 'completada'])->distinct('paciente_id')->count('paciente_id');
        $promedio        = Cita::where('consultorio_id', $id)->whereNotNull('calificacion')->avg('calificacion');

        return response()->json([
            'top_tratamientos'      => $topTratamientos,
            'citas_mes'             => $citasMes,
            'total_general'         => $totalGeneral,
            'pacientes_unicos'      => $pacientesUnicos,
            'calificacion_promedio' => round($promedio ?? 0, 1),
        ]);
    }

    public function pacientes(Request $request): JsonResponse
    {
        $id = $request->user()->consultorio->id;

        $lista = DB::table('citas')
            ->join('pacientes', 'citas.paciente_id', '=', 'pacientes.id')
            ->join('users', 'pacientes.user_id', '=', 'users.id')
            ->where('citas.consultorio_id', $id)
            ->groupBy('pacientes.id', 'users.name', 'users.email', 'users.telefono')
            ->select(
                'pacientes.id',
                'users.name',
                'users.email',
                'users.telefono',
                DB::raw('count(*) as total_citas'),
                DB::raw('max(citas.fecha) as ultima_visita')
            )
            ->orderByDesc('ultima_visita')
            ->get();

        return response()->json($lista);
    }

    public function historialPaciente(Request $request, int $pacienteId): JsonResponse
    {
        $id = $request->user()->consultorio->id;

        $citas = Cita::where('consultorio_id', $id)
            ->where('paciente_id', $pacienteId)
            ->with(['tratamiento', 'paciente.user'])
            ->orderBy('fecha', 'desc')
            ->get();

        abort_if($citas->isEmpty(), 404);

        return response()->json([
            'paciente' => $citas->first()->paciente->user->only(['name', 'email', 'telefono']),
            'citas'    => $citas,
        ]);
    }
}
