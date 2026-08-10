<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Document extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'document_master';

    protected $primaryKey = 'docId';

    public $incrementing = true;

    protected $keyType = 'int';

    protected $fillable = [
        'title',
        'description',
        'partyName',
        'docType',
        'date',
        'soft_copy',
        'status',
        'attachment',
    ];

    protected $casts = [
        'date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Route model binding uses docId.
     */
    public function getRouteKeyName(): string
    {
        return 'docId';
    }

    /**
     * Party associated with this document.
     */
    public function party(): BelongsTo
    {
        return $this->belongsTo(
            PartyMaster::class,
            'partyName',
            'partyId'
        );
    }

    /**
     * Document type associated with this document.
     */
    public function documentType(): BelongsTo
    {
        return $this->belongsTo(
            DocumentType::class,
            'docType',
            'document_id'
        );
    }

    /**
     * User who created this document.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'created_by'
        );
    }

    /**
     * User who last updated this document.
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
        static::creating(function (Document $document) {
            $document->created_by = auth()->id();
        });

        static::updating(function (Document $document) {
            $document->updated_by = auth()->id();
        });
    }
    // Relationships (One-to-Many)
    public function dateDetails(): HasMany
    {
        return $this->hasMany(
            DateDetail::class,
            'docId',
            'docId'
        );
    }
}