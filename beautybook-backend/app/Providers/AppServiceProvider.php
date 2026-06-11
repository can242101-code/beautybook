<?php

namespace App\Providers;

use App\Events\CitaCancelada;
use App\Events\NuevaCitaRegistrada;
use App\Listeners\EnviarNotificacionCitaCancelada;
use App\Listeners\EnviarNotificacionNuevaCita;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        Event::listen(NuevaCitaRegistrada::class, EnviarNotificacionNuevaCita::class);
        Event::listen(CitaCancelada::class, EnviarNotificacionCitaCancelada::class);
    }
}
