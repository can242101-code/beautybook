<?php

use App\Models\User;

$u = User::where('role', 'gestor')->first();
if ($u) {
    $u->update(['password' => bcrypt('Password123!')]);
    echo 'UPDATED:' . $u->email . "\n";
} else {
    $n = User::create([
        'name'     => 'Gestor Admin',
        'email'    => 'gestor_bb@test.com',
        'password' => bcrypt('Password123!'),
        'role'     => 'gestor',
    ]);
    echo 'CREATED:' . $n->email . "\n";
}
