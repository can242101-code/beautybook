<?php

namespace App\Services\Notifications;

use App\Models\Cita;
use App\Services\Notifications\Contracts\NotificacionInterface;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class EmailNotificacion implements NotificacionInterface
{
    public function enviarConfirmacion(Cita $cita): void
    {
        Log::info("Email confirmación → {$cita->paciente->user->email}", ['cita_id' => $cita->id]);
        // Mail::to($cita->paciente->user->email)->send(new \App\Mail\CitaConfirmada($cita));
    }

    public function enviarCancelacion(Cita $cita): void
    {
        Log::info("Email cancelación → {$cita->paciente->user->email}", ['cita_id' => $cita->id]);
    }

    public function enviarRecordatorio(Cita $cita): void
    {
        Log::info("Email recordatorio → {$cita->paciente->user->email}", ['cita_id' => $cita->id]);
    }
}
