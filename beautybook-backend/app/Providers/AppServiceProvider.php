<?php

namespace App\Providers;

use App\Events\CitaCancelada;
use App\Events\NuevaCitaRegistrada;
use App\Listeners\EnviarNotificacionCitaCancelada;
use App\Listeners\EnviarNotificacionNuevaCita;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        Event::listen(NuevaCitaRegistrada::class, EnviarNotificacionNuevaCita::class);
        Event::listen(CitaCancelada::class, EnviarNotificacionCitaCancelada::class);

        ResetPassword::createUrlUsing(function ($notifiable, string $token): string {
            $base = env('FRONTEND_URL', 'http://localhost:3000');
            return "{$base}/reset-password?token={$token}&email=" . urlencode($notifiable->email);
        });
    }
}
