<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DateType extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'date_types';

    protected $primaryKey = 'dateTypeId';

    public $incrementing = true;

    protected $keyType = 'int';

    protected $fillable = [
        'dateTypeName',
        'status',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Route model binding should resolve on dateTypeId,
     * since this table has no `id` column.
     */
    public function getRouteKeyName(): string
    {
        return 'dateTypeId';
    }

    /**
     * User who created this record.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'created_by'
        );
    }

    /**
     * User who last updated this record.
     */
    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'updated_by'
        );
    }

    protected static function booted(): void
    {
        static::creating(function (DateType $dateType) {
            $dateType->created_by = auth()->id();
        });

        static::updating(function (DateType $dateType) {
            $dateType->updated_by = auth()->id();
        });
    }

    // Relationships
    public function dateDetails(): HasMany
    {
        return $this->hasMany(
            DateDetail::class,
            'dateTypeId',
            'dateTypeId'
        );
    }   
}