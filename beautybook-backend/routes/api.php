<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CitaController;
use App\Http\Controllers\Api\ConsultorioController;
use App\Http\Controllers\Api\DisponibilidadController;
use App\Http\Controllers\Api\HorarioController;
use App\Http\Controllers\Api\TratamientoController;
use Illuminate\Support\Facades\Route;

// Públicas
Route::post('/register',       [AuthController::class, 'register']);
Route::post('/login',          [AuthController::class, 'login']);
Route::get('/consultorios',    [ConsultorioController::class, 'index']);
Route::get('/consultorios/{id}', [ConsultorioController::class, 'show']);
Route::get('/disponibilidad',  [DisponibilidadController::class, 'index']);

// Autenticadas
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // Paciente
    Route::middleware('role:paciente')->group(function () {
        Route::get('/citas',           [CitaController::class, 'index']);
        Route::post('/citas',          [CitaController::class, 'store']);
        Route::get('/citas/{id}',      [CitaController::class, 'show']);
        Route::patch('/citas/{id}/cancelar', [CitaController::class, 'cancelar']);
    });

    // Consultorio
    Route::middleware('role:consultorio')->group(function () {
        Route::get('/consultorio/agenda',                    [CitaController::class, 'index']);
        Route::patch('/consultorio/perfil',                  [ConsultorioController::class, 'update']);
        Route::patch('/consultorio/citas/{id}/estado',       [CitaController::class, 'actualizarEstado']);

        Route::get('/tratamientos',                 [TratamientoController::class, 'index']);
        Route::post('/tratamientos',                [TratamientoController::class, 'store']);
        Route::put('/tratamientos/{id}',            [TratamientoController::class, 'update']);
        Route::delete('/tratamientos/{id}',         [TratamientoController::class, 'destroy']);

        Route::get('/horarios',                     [HorarioController::class, 'index']);
        Route::post('/horarios',                    [HorarioController::class, 'store']);
        Route::put('/horarios/{id}',                [HorarioController::class, 'update']);
        Route::delete('/horarios/{id}',             [HorarioController::class, 'destroy']);
    });

    // Gestor (admin)
    Route::middleware('role:gestor')->prefix('admin')->group(function () {
        Route::get('/consultorios',                     [AdminController::class, 'consultorios']);
        Route::get('/consultorios/{id}',                [AdminController::class, 'showConsultorio']);
        Route::put('/consultorios/{id}/membrecia',      [AdminController::class, 'actualizarMembrecia']);
        Route::patch('/consultorios/{id}/bloquear',     [AdminController::class, 'bloquearConsultorio']);
    });
});
