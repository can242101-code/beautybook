<?php

namespace App\Providers;

use App\Events\CitaCancelada;
use App\Events\NuevaCitaRegistrada;
use App\Listeners\EnviarNotificacionCitaCancelada;
use App\Listeners\EnviarNotificacionNuevaCita;
use App\Services\Notifications\NotificacionFactory;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Database\ConnectionInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\ServiceProvider;
use Symfony\Component\Mailer\Bridge\Brevo\Transport\BrevoApiTransport;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Patrón Singleton — una sola instancia de conexión a la BD reutilizada
        // por todos los repositorios durante el ciclo de vida de la petición.
        $this->app->singleton(ConnectionInterface::class, fn () => DB::connection());

        // Patrón Singleton — una sola instancia del factory de notificaciones.
        $this->app->singleton(NotificacionFactory::class);
    }

    public function boot(): void
    {
        // Registra transporte HTTP de Brevo (evita bloqueo de puertos SMTP en Railway)
        Mail::extend('brevo', function (array $config) {
            return new BrevoApiTransport($config['key'] ?? '');
        });

        // Patrón Observer — escucha eventos de citas y despacha notificaciones.
        Event::listen(NuevaCitaRegistrada::class, EnviarNotificacionNuevaCita::class);
        Event::listen(CitaCancelada::class,       EnviarNotificacionCitaCancelada::class);

        ResetPassword::createUrlUsing(function ($notifiable, string $token): string {
            $base = env('FRONTEND_URL', 'http://localhost:3000');
            return "{$base}/reset-password?token={$token}&email=" . urlencode($notifiable->email);
        });
    }
}
