<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'type',
        'aperture_mm',
        'focal_mm',
        'mount',
        'max_magnification',
        'price',
        'stock',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'aperture_mm' => 'integer',
            'focal_mm' => 'integer',
            'max_magnification' => 'integer',
            'price' => 'decimal:2',
            'stock' => 'integer',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
