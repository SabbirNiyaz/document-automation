<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
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
}