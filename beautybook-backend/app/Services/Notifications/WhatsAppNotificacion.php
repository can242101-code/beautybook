<?php

namespace App\Services\Notifications;

use App\Models\Cita;
use App\Services\Notifications\Contracts\NotificacionInterface;
use Illuminate\Support\Facades\Log;

class WhatsAppNotificacion implements NotificacionInterface
{
    public function enviarConfirmacion(Cita $cita): void
    {
        $telefono = $cita->paciente->user->telefono ?? 'sin teléfono';
        Log::info("WhatsApp confirmación → {$telefono}", ['cita_id' => $cita->id]);
        // Integrar con Twilio/Meta Cloud API aquí
    }

    public function enviarCancelacion(Cita $cita): void
    {
        $telefono = $cita->paciente->user->telefono ?? 'sin teléfono';
        Log::info("WhatsApp cancelación → {$telefono}", ['cita_id' => $cita->id]);
    }

    public function enviarRecordatorio(Cita $cita): void
    {
        $telefono = $cita->paciente->user->telefono ?? 'sin teléfono';
        Log::info("WhatsApp recordatorio → {$telefono}", ['cita_id' => $cita->id]);
    }
}
