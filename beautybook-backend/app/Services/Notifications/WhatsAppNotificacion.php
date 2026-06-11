<?php

namespace App\Services\Notifications;

use App\Models\Cita;
use App\Services\Notifications\Contracts\NotificacionInterface;
use Illuminate\Support\Facades\Log;

class WhatsAppNotificacion implements NotificacionInterface
{
    public function enviarConfirmacion(Cita $cita): void
    {
        Log::info("WhatsApp confirmación → {$cita->paciente->user->telefono}", ['cita_id' => $cita->id]);
        // Integrar con Twilio/Meta Cloud API aquí
    }

    public function enviarCancelacion(Cita $cita): void
    {
        Log::info("WhatsApp cancelación → {$cita->paciente->user->telefono}", ['cita_id' => $cita->id]);
    }

    public function enviarRecordatorio(Cita $cita): void
    {
        Log::info("WhatsApp recordatorio → {$cita->paciente->user->telefono}", ['cita_id' => $cita->id]);
    }
}
