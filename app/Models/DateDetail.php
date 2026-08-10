<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DateDetail extends Model
{
    use SoftDeletes;

    protected $table = 'date_details';

    protected $primaryKey = 'id';

    protected $fillable = [
        'dateTypeId',
        'docId',
        'date_value',
        'status',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'date_value' => 'date:Y-m-d',
    ];

    /**
     * Date Type relationship.
     */
    public function dateType(): BelongsTo
    {
        return $this->belongsTo(
            DateType::class,
            'dateTypeId',
            'dateTypeId'
        );
    }

    /**
     * Document Master relationship.
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
     * Created By relationship.
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
     * Updated By relationship.
     */
    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'updated_by',
            'id'
        );
    }
}