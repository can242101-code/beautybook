<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Recordatorios automáticos — se ejecuta todos los días a las 8:00 AM
// Cubre el HU06 del backlog: paciente recibe recordatorio antes de su cita
Schedule::command('bb:recordatorios')->dailyAt('08:00');
