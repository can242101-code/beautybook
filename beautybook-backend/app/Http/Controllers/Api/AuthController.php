<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Consultorio;
use App\Models\Membrecia;
use App\Models\Paciente;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'email'       => 'required|email|unique:users',
            'password'    => 'required|string|min:8|confirmed',
            'role'        => 'required|in:paciente,consultorio',
            'telefono'    => 'nullable|string|max:20',
            'nombre'      => 'required_if:role,consultorio|string|max:255',
            'direccion'   => 'required_if:role,consultorio|string',
            'ciudad'      => 'required_if:role,consultorio|string|max:100',
        ]);

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
            'role'     => $data['role'],
            'telefono' => $data['telefono'] ?? null,
        ]);

        if ($user->role === 'consultorio') {
            $consultorio = Consultorio::create([
                'user_id'   => $user->id,
                'nombre'    => $data['nombre'],
                'direccion' => $data['direccion'],
                'ciudad'    => $data['ciudad'],
                'telefono'  => $data['telefono'] ?? null,
            ]);

            Membrecia::create([
                'consultorio_id'   => $consultorio->id,
                'plan'             => 'gratuito',
                'limite_citas_mes' => 20,
                'fecha_inicio'     => Carbon::today(),
                'fecha_vencimiento'=> Carbon::today()->addYear(),
                'activa'           => true,
            ]);
        } else {
            Paciente::create(['user_id' => $user->id]);
        }

        $token = $user->createToken('beautybook')->plainTextToken;

        return response()->json([
            'user'  => $user->load($user->role === 'consultorio' ? 'consultorio' : 'paciente'),
            'token' => $token,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages(['email' => ['Credenciales incorrectas.']]);
        }

        $token = $user->createToken('beautybook')->plainTextToken;

        return response()->json([
            'user'  => $user->load($user->role === 'consultorio' ? 'consultorio' : 'paciente'),
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Sesión cerrada.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user()->load($request->user()->role === 'consultorio' ? 'consultorio' : 'paciente'));
    }
}
