<?php
use App\Models\User;
use Illuminate\Support\Facades\Hash;

$email = 'gestor_bb@test.com';
$u = User::where('email', $email)->first();
if (!$u) {
    $u = User::create([
        'name'     => 'Gestor Admin',
        'email'    => $email,
        'password' => Hash::make('Password123!'),
        'role'     => 'gestor',
    ]);
    echo "CREADO id=" . $u->id . "\n";
} else {
    echo "YA_EXISTE id=" . $u->id . "\n";
}
