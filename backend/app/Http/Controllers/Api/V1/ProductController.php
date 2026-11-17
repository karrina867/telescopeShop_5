<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::query()->with('category');

        if ($search = $request->query('q')) {
            $query->where('name', 'like', '%'.$search.'%');
        }

        if ($categoryId = $request->query('category_id')) {
            $query->where('category_id', $categoryId);
        }

        if ($minPrice = $request->query('min_price')) {
            $query->where('price', '>=', (float) $minPrice);
        }

        if ($maxPrice = $request->query('max_price')) {
            $query->where('price', '<=', (float) $maxPrice);
        }

        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }

        if ($request->boolean('in_stock')) {
            $query->where('stock', '>', 0);
        }

        if ($date = $request->query('date')) {
            $query->whereDate('created_at', $date);
        }

        if ($from = $request->query('from')) {
            $query->whereDate('created_at', '>=', $from);
        }

        if ($to = $request->query('to')) {
            $query->whereDate('created_at', '<=', $to);
        }

        $sort = (string) $request->query('sort', 'created_at');
        if (! in_array($sort, ['id', 'name', 'price', 'stock', 'created_at'], true)) {
            $sort = 'created_at';
        }

        $direction = $request->query('direction') === 'asc' ? 'asc' : 'desc';

        $perPage = (int) $request->query('per_page', 10);
        $perPage = max(1, min($perPage, 100));

        return response()->json(
            $query->orderBy($sort, $direction)->paginate($perPage)->withQueryString()
        );
    }

    public function meta(): JsonResponse
    {
        return response()->json([
            'types' => Product::query()->whereNotNull('type')->distinct()->orderBy('type')->pluck('type'),
            'mounts' => Product::query()->whereNotNull('mount')->distinct()->orderBy('mount')->pluck('mount'),
            'price_min' => (float) (Product::min('price') ?? 0),
            'price_max' => (float) (Product::max('price') ?? 0),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $product = Product::create($this->validated($request));

        return response()->json($product->load('category'), 201);
    }

    public function show(Product $product): JsonResponse
    {
        return response()->json($product->load('category'));
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $product->update($this->validated($request));

        return response()->json($product->load('category'));
    }

    public function destroy(Product $product): Response
    {
        $product->delete();

        return response()->noContent();
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'type' => ['nullable', 'string', 'max:255'],
            'aperture_mm' => ['nullable', 'integer', 'min:0'],
            'focal_mm' => ['nullable', 'integer', 'min:0'],
            'mount' => ['nullable', 'string', 'max:255'],
            'max_magnification' => ['nullable', 'integer', 'min:0'],
            'price' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'description' => ['nullable', 'string'],
        ]);
    }
}
