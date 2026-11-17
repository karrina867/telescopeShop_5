<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use TCG\Voyager\Models\Role;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $adminRoleId = Role::where('name', 'admin')->value('id');

        $user = User::firstOrCreate(
            ['email' => 'admin@orbita.by'],
            [
                'name' => 'Administrator',
                'password' => 'admin12345',
                'role_id' => $adminRoleId,
            ]
        );

        $user->setRole('admin');
    }
}
