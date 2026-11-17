<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ImportController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'file_name' => ['nullable', 'string', 'max:255'],
            'rows' => ['required', 'array', 'min:1'],
            'rows.*.name' => ['required', 'string', 'max:255'],
            'rows.*.category' => ['nullable', 'string', 'max:255'],
            'rows.*.type' => ['nullable', 'string', 'max:255'],
            'rows.*.aperture_mm' => ['nullable', 'integer', 'min:0'],
            'rows.*.focal_mm' => ['nullable', 'integer', 'min:0'],
            'rows.*.mount' => ['nullable', 'string', 'max:255'],
            'rows.*.max_magnification' => ['nullable', 'integer', 'min:0'],
            'rows.*.price' => ['required', 'numeric', 'min:0'],
            'rows.*.stock' => ['required', 'integer', 'min:0'],
            'rows.*.description' => ['nullable', 'string'],
        ]);

        $created = 0;
        $updated = 0;

        DB::transaction(function () use ($data, &$created, &$updated) {
            foreach ($data['rows'] as $row) {
                $categoryId = null;
                $categoryName = trim((string) ($row['category'] ?? ''));

                if ($categoryName !== '') {
                    $categoryId = Category::firstOrCreate(
                        ['name' => $categoryName],
                        ['slug' => Str::slug($categoryName)]
                    )->id;
                }

                $product = Product::updateOrCreate(
                    ['name' => trim($row['name'])],
                    [
                        'category_id' => $categoryId,
                        'type' => $row['type'] ?? null,
                        'aperture_mm' => $row['aperture_mm'] ?? null,
                        'focal_mm' => $row['focal_mm'] ?? null,
                        'mount' => $row['mount'] ?? null,
                        'max_magnification' => $row['max_magnification'] ?? null,
                        'price' => $row['price'],
                        'stock' => $row['stock'],
                        'description' => $row['description'] ?? null,
                    ]
                );

                $product->wasRecentlyCreated ? $created++ : $updated++;
            }
        });

        return response()->json([
            'message' => "Импорт завершён: добавлено {$created}, обновлено {$updated}.",
            'created' => $created,
            'updated' => $updated,
        ]);
    }
}
