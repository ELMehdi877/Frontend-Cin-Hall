<?php

namespace App\Http\Controllers;

use App\Models\Film;
use Illuminate\Http\Request;

class FilmController extends Controller
{
    public function index()
    {
        $films = Film::latest()->get();

        return response()->json($films, 200);
    }

    public function store(Request $request)
    {
        if (!auth()->check() || !auth()->user()->is_admin) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'genre' => 'nullable|string|max:255',
            'actors' => 'nullable|string|max:255',
            'duration_minutes' => 'required|integer|min:1',
            'minimum_age' => 'required|integer|min:0',
            'trailer_url' => 'required|url|max:255',
        ]);

        $film = Film::create($validated);

        return response()->json([
            'message' => 'Film created successfully',
            'film' => $film,
        ], 201);
    }

    public function show(Film $film)
    {
        return response()->json($film, 200);
    }

    public function update(Request $request, Film $film)
    {
        if (!auth()->check() || !auth()->user()->is_admin) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'genre' => 'nullable|string|max:255',
            'actors' => 'nullable|string|max:255',
            'duration_minutes' => 'sometimes|required|integer|min:1',
            'minimum_age' => 'sometimes|required|integer|min:0',
            'trailer_url' => 'sometimes|required|url|max:255',
        ]);

        $film->update($validated);

        return response()->json([
            'message' => 'Film updated successfully',
            'film' => $film,
        ], 200);
    }

    public function destroy(Film $film)
    {
        if (!auth()->check() || !auth()->user()->is_admin) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $film->delete();

        return response()->json([
            'message' => 'Film deleted successfully',
        ], 200);
    }
}