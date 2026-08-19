<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Document extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'document_master';

    protected $primaryKey = 'docId';

    public $incrementing = true;

    protected $keyType = 'int';

    protected $fillable = [
        'title',
        'short_code',
        'description',
        'partyName',
        'docType',
        'date',
        'soft_copy',
        'status',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function getRouteKeyName(): string
    {
        return 'docId';
    }

    public function party(): BelongsTo
    {
        return $this->belongsTo(
            PartyMaster::class,
            'partyName',
            'partyId'
        );
    }

    public function documentType(): BelongsTo
    {
        return $this->belongsTo(
            DocumentType::class,
            'docType',
            'document_id'
        );
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'created_by',
            'id'
        );
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'updated_by',
            'id'
        );
    }

    public function dateDetails(): HasMany
    {
        return $this->hasMany(
            DateDetail::class,
            'docId',
            'docId'
        );
    }

    /**
     * Attachments (PDFs) belonging to this document.
     */
    public function attachments(): HasMany
    {
        return $this->hasMany(
            Attachment::class,
            'docId',
            'docId'
        );
    }

    protected static function booted(): void
    {
        static::creating(function (Document $document) {
            if (auth()->check()) {
                $document->created_by = auth()->id();
            }
        });

        static::updating(function (Document $document) {
            if (auth()->check()) {
                $document->updated_by = auth()->id();
            }
        });
    }
}