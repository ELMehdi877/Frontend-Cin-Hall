<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSessionRequest;
use App\Http\Requests\UpdateSessionRequest;
use App\Models\Session;
use App\QueryBuilders\SessionQuery;
use Illuminate\Http\Request;

class SessionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {

        $query = SessionQuery::base();
        if ($request->filled('type'))
            {
                $query = SessionQuery::applyFilters($query, $request->query('type'));
            }
        return response()->json($query->get());
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(StoreSessionRequest $request)
    {

    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSessionRequest $request)
    {
        $session = Session::create($request->validated());

        return response()->json([
            'session' => $session,
            'message' => 'Session created successfully',
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Session $session)
    {
        return response()->json($session);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Session $session)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSessionRequest $request, Session $session)
    {
        $session->update($request->validated());

        return response()->json([
            'session' => $session->fresh(),
            'message' => 'Session updated successfully',
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Session $session)
    {
        $session->delete();

        return response()->json([
            "message" => "Session deleted successfully",
        ]);
    }


    public function filter(Request $request)
    {
        $type = $request->query('type');
        $query = SessionQuery::applyFilters(SessionQuery::base(), $type);

        return response()->json($query->get());
    }
}
