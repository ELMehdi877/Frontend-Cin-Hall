<?php

namespace App\QueryBuilders;

use App\Models\Session;
use Illuminate\Database\Eloquent\Builder;

final class SessionQuery
{
    public static function base(): Builder
    {
        return Session::query();
    }

    public static function applyFilters(Builder $query, ?string $type): Builder
    {
        if ($type !== null && $type !== '') {
            $query->where('type', $type);
        }

        return $query;
    }
}
