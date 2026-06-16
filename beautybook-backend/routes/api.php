<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CitaController;
use App\Http\Controllers\Api\ConsultorioController;
use App\Http\Controllers\Api\DisponibilidadController;
use App\Http\Controllers\Api\EstadisticasController;
use App\Http\Controllers\Api\HorarioController;
use App\Http\Controllers\Api\MembreciaController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\TratamientoController;
use Illuminate\Support\Facades\Route;

// Públicas
Route::middleware('throttle:10,1')->group(function () {
    Route::post('/login',           [AuthController::class,       'login']);
    Route::post('/register',        [AuthController::class,       'register']);
    Route::post('/forgot-password', [PasswordResetController::class, 'sendLink']);
    Route::post('/reset-password',  [PasswordResetController::class, 'reset']);
});
// Login via enlace de invitación (token de un solo uso)
Route::get('/acceso/{token}', [AuthController::class, 'loginConToken']);
// Planes disponibles (pública para la página de precios)
Route::get('/membrecia/planes', [MembreciaController::class, 'planes']);
Route::get('/consultorios',      [ConsultorioController::class, 'index']);
Route::get('/consultorios/{id}', [ConsultorioController::class, 'show']);
Route::get('/disponibilidad',      [DisponibilidadController::class, 'index']);
Route::get('/disponibilidad/dias', [DisponibilidadController::class, 'dias']);

// Autenticadas
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout',  [AuthController::class, 'logout']);
    Route::get('/me',       [AuthController::class, 'me']);
    Route::patch('/perfil', [AuthController::class, 'actualizarPerfil']);

    // Paciente
    Route::middleware('role:paciente')->group(function () {
        Route::get('/citas',                      [CitaController::class, 'index']);
        Route::post('/citas',                     [CitaController::class, 'store']);
        Route::get('/citas/{id}',                 [CitaController::class, 'show']);
        Route::patch('/citas/{id}/cancelar',      [CitaController::class, 'cancelar']);
        Route::patch('/citas/{id}/reagendar',     [CitaController::class, 'reagendar']);
        Route::post('/citas/{id}/calificar',      [CitaController::class, 'calificar']);
    });

    // Consultorio
    Route::middleware('role:consultorio')->group(function () {
        Route::get('/consultorio/agenda',                    [CitaController::class, 'index']);
        Route::patch('/consultorio/perfil',                  [ConsultorioController::class, 'update']);
        Route::patch('/consultorio/citas/{id}/estado',       [CitaController::class, 'actualizarEstado']);
        Route::patch('/consultorio/citas/{id}/cancelar',    [CitaController::class, 'cancelarPorConsultorio']);

        Route::get('/tratamientos',                 [TratamientoController::class, 'index']);
        Route::post('/tratamientos',                [TratamientoController::class, 'store']);
        Route::put('/tratamientos/{id}',            [TratamientoController::class, 'update']);
        Route::delete('/tratamientos/{id}',         [TratamientoController::class, 'destroy']);

        Route::get('/horarios',                     [HorarioController::class, 'index']);
        Route::post('/horarios',                    [HorarioController::class, 'store']);
        Route::put('/horarios/{id}',                [HorarioController::class, 'update']);
        Route::delete('/horarios/{id}',             [HorarioController::class, 'destroy']);

        Route::get('/consultorio/pacientes',        [EstadisticasController::class, 'pacientes']);
        Route::get('/consultorio/pacientes/{id}',   [EstadisticasController::class, 'historialPaciente']);
        Route::get('/consultorio/estadisticas',     [EstadisticasController::class, 'estadisticas']);

        // Membresía — autogestión del consultorio
        Route::get('/consultorio/membrecia',        [MembreciaController::class, 'mi']);
        Route::put('/consultorio/membrecia/plan',   [MembreciaController::class, 'cambiarPlan']);
    });

    // Gestor (admin) — valida y bloquea consultorios, no gestiona planes
    Route::middleware('role:gestor')->prefix('admin')->group(function () {
        Route::get('/consultorios',                 [AdminController::class, 'consultorios']);
        Route::get('/consultorios/{id}',            [AdminController::class, 'showConsultorio']);
        Route::patch('/consultorios/{id}/activar',  [AdminController::class, 'activarConsultorio']);
        Route::patch('/consultorios/{id}/bloquear', [AdminController::class, 'bloquearConsultorio']);
    });
});
