<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PartyMaster extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'party_master';

    protected $primaryKey = 'partyId';

    public $incrementing = true;

    protected $keyType = 'int';

    protected $fillable = [
        'partyName',
        'address',
        'partyTypeId',
        'contactPerson',
        'phone',
        'email',
        'status',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Route model binding should use partyId.
     */
    public function getRouteKeyName(): string
    {
        return 'partyId';
    }

    /**
     * Party Type relationship.
     */
    public function partyType(): BelongsTo
    {
        return $this->belongsTo(
            PartyType::class,
            'partyTypeId',
            'partyTypeId'
        );
    }

    /**
     * Documents belonging to this party.
     */
    public function documents(): HasMany
    {
        return $this->hasMany(
            Document::class,
            'partyName',
            'partyId'
        );
    }

    /**
     * User who created this party.
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
     * User who last updated this party.
     */
    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'updated_by',
            'id'
        );
    }

    /**
     * Automatically set created_by.
     */
    protected static function booted(): void
    {
        static::creating(function (PartyMaster $party) {
            $party->created_by = auth()->id();
        });

        /**
         * Automatically set updated_by.
         */
        static::updating(function (PartyMaster $party) {
            $party->updated_by = auth()->id();
        });
    }
}