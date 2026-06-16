<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ConsultorioActivado;
use App\Models\Consultorio;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

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

    public function activarConsultorio(int $id): JsonResponse
    {
        $consultorio = Consultorio::with('user')->findOrFail($id);
        $consultorio->update(['activo' => true]);
        $consultorio->membrecia?->update(['activa' => true]);

        // Genera token de invitación válido por 48 h
        $token = Str::random(48);
        $consultorio->user->update([
            'token_invitacion'            => $token,
            'token_invitacion_expires_at' => now()->addHours(48),
        ]);

        // Envía notificación al consultorio con enlace de acceso directo
        Mail::to($consultorio->user->email)
            ->send(new ConsultorioActivado($consultorio->user, $token));

        return response()->json(['message' => 'Consultorio activado. Se ha enviado la notificación por correo.']);
    }

    public function bloquearConsultorio(int $id): JsonResponse
    {
        $consultorio = Consultorio::findOrFail($id);
        $consultorio->update(['activo' => false]);
        $consultorio->membrecia?->update(['activa' => false]);
        return response()->json(['message' => 'Consultorio bloqueado.']);
    }
}
