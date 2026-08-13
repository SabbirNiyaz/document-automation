<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Attachment extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'attachment_master';

    protected $primaryKey = 'attachmentId';

    public $incrementing = true;

    protected $keyType = 'int';

    protected $fillable = [
        'docId',
        'file_name',
        'file_path',
        'file_type',
        'file_size',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function getRouteKeyName(): string
    {
        return 'attachmentId';
    }

    /**
     * Document this attachment belongs to.
     */
    public function document(): BelongsTo
    {
        return $this->belongsTo(
            Document::class,
            'docId',
            'docId'
        );
    }

    /**
     * User who created this attachment.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'created_by',
            'id'
        );
    }

    /**
     * Automatically set created_by / updated_by.
     */
    protected static function booted(): void
    {
        static::creating(function (Attachment $attachment) {
            if (auth()->check()) {
                $attachment->created_by = auth()->id();
            }
        });

        static::updating(function (Attachment $attachment) {
            if (auth()->check()) {
                $attachment->updated_by = auth()->id();
            }
        });
    }
}