<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class DemoProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'category' => 'Рефракторы',
                'name' => 'Орбита Start 70 AZ',
                'type' => 'Рефрактор',
                'aperture_mm' => 70,
                'focal_mm' => 700,
                'mount' => 'AZ',
                'max_magnification' => 140,
                'price' => 1899,
                'stock' => 5,
                'description' => 'Отличный выбор для первого телескопа.',
            ],
            [
                'category' => 'Рефракторы',
                'name' => 'Орбита Luna 90 EQ',
                'type' => 'Рефрактор',
                'aperture_mm' => 90,
                'focal_mm' => 900,
                'mount' => 'EQ',
                'max_magnification' => 180,
                'price' => 3400,
                'stock' => 4,
                'description' => 'Экваториальная монтировка для детальных наблюдений Луны и планет.',
            ],
            [
                'category' => 'Рефлекторы',
                'name' => 'Орбита DeepSky 130',
                'type' => 'Рефлектор',
                'aperture_mm' => 130,
                'focal_mm' => 650,
                'mount' => 'EQ',
                'max_magnification' => 260,
                'price' => 4600,
                'stock' => 3,
                'description' => 'Параболическое зеркало для туманностей и галактик.',
            ],
            [
                'category' => 'Добсонианцы',
                'name' => 'Орбита Pro 200 Dob',
                'type' => 'Добсон',
                'aperture_mm' => 200,
                'focal_mm' => 1200,
                'mount' => 'Dob',
                'max_magnification' => 400,
                'price' => 7990,
                'stock' => 2,
                'description' => 'Максимум деталей для тёмного загородного неба.',
            ],
        ];

        foreach ($products as $data) {
            $category = Category::firstOrCreate(
                ['name' => $data['category']],
                ['slug' => \Illuminate\Support\Str::slug($data['category'])],
            );

            Product::updateOrCreate(
                ['name' => $data['name']],
                [
                    'category_id' => $category->id,
                    'type' => $data['type'],
                    'aperture_mm' => $data['aperture_mm'],
                    'focal_mm' => $data['focal_mm'],
                    'mount' => $data['mount'],
                    'max_magnification' => $data['max_magnification'],
                    'price' => $data['price'],
                    'stock' => $data['stock'],
                    'description' => $data['description'],
                ],
            );
        }
    }
}
