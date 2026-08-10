<?php

namespace App\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PartyType extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'party_types';
    protected $primaryKey = 'partyTypeId';

    protected $fillable = [
        'partyTypeName',
        'status',
    ];

    public function getRouteKeyName(): string
    {
        return 'partyTypeId';
    }

    /**
     * User who created this record.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * User who last modified this record.
     */
    public function modifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'modified_by');
    }

    protected static function booted(): void
    {
        static::creating(function (PartyType $partyType) {
            $partyType->created_by = auth()->id();
            // modified_by intentionally left null — only set on an actual edit
        });

        static::updating(function (PartyType $partyType) {
            $partyType->modified_by = auth()->id();
        });
    }

    /**
     * Parties belonging to this party type.
     */
    public function parties(): HasMany
    {
        return $this->hasMany(
            PartyMaster::class,
            'partyTypeId',
            'partyTypeId'
        );
    }
}