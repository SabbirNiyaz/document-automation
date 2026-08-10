<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class DocumentType extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'document_type';

    protected $primaryKey = 'document_id';

    public $incrementing = true;

    protected $keyType = 'int';

    protected $fillable = [
        'document_name',
        'status',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Route model binding should resolve on document_id,
     * since this table has no id column.
     */
    public function getRouteKeyName(): string
    {
        return 'document_id';
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
        static::creating(function (DocumentType $documentType) {
            $documentType->created_by = auth()->id();
        });

        static::updating(function (DocumentType $documentType) {
            $documentType->updated_by = auth()->id();
        });
    }
}