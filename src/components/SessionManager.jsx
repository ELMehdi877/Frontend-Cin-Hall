import { useEffect, useState } from "react";
import axios from "axios";

export default function SessionManager() {
  // Etats du formulaire session
  const [filmId, setFilmId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [language, setLanguage] = useState("ta3rabt");
  const [price, setPrice] = useState(100);
  const [startTime, setStartTime] = useState("");
  const [type, setType] = useState("normal");
  const [editingSessionId, setEditingSessionId] = useState(null);

  // Donnees pour le formulaire
  const [films, setFilms] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [sessions, setSessions] = useState([]);

  // Etats de chargement
  const [loadingLists, setLoadingLists] = useState(false);
  const [loading, setLoading] = useState(false);

  // Messages simples pour l'utilisateur
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      return null;
    }

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const normalizeList = (data) => {
    return Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  };

  const normalizeType = (value) => String(value || "").toLowerCase();

  const resetForm = () => {
    setFilmId("");
    setRoomId("");
    setLanguage("ta3rabt");
    setPrice(100);
    setStartTime("");
    setType("normal");
    setEditingSessionId(null);
  };

  const toDateTimeLocal = (value) => {
    if (!value) {
      return "";
    }

    // Transforme "2026-04-05 18:30:00" ou ISO en format accepte par datetime-local
    return String(value).replace(" ", "T").slice(0, 16);
  };

  const formatDateTime = (value) => {
    if (!value) {
      return "-";
    }

    const parsedDate = new Date(String(value).replace(" ", "T"));

    if (Number.isNaN(parsedDate.getTime())) {
      return value;
    }

    return parsedDate.toLocaleString("fr-FR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const loadBaseData = async () => {
    setLoadingLists(true);
    setError("");

    try {
      const config = getAuthConfig();

      if (!config) {
        setError("Token introuvable. Merci de vous connecter.");
        return;
      }

      // On charge les films et les rooms pour pouvoir creer une session
      const [filmsResponse, roomsResponse, sessionsResponse] = await Promise.all([
        axios.get("http://127.0.0.1:8000/api/films", config),
        axios.get("http://127.0.0.1:8000/api/rooms", config),
        axios.get("http://127.0.0.1:8000/api/sessions", config),
      ]);

      setFilms(normalizeList(filmsResponse.data));
      setRooms(normalizeList(roomsResponse.data));
      setSessions(normalizeList(sessionsResponse.data));
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de charger les donnees de base");
    } finally {
      setLoadingLists(false);
    }
  };

  useEffect(() => {
    loadBaseData();
  }, []);

  // On garde seulement les rooms qui correspondent au type de session choisi
  // Exemple: session type normal -> rooms normales uniquement
  const filteredRooms = rooms.filter((room) => {
    if (!room?.id) {
      return false;
    }

    // En mode edition, on garde aussi la room deja choisie
    if (String(room.id) === String(roomId)) {
      return true;
    }

    return normalizeType(room.type) === normalizeType(type);
  });

  useEffect(() => {
    if (!roomId) {
      return;
    }

    const selectedRoom = rooms.find((room) => String(room.id) === String(roomId));
    if (!selectedRoom) {
      return;
    }

    // Si l'utilisateur change le type de session, on vide roomId si incompatibilite
    if (normalizeType(selectedRoom.type) !== normalizeType(type)) {
      setRoomId("");
    }
  }, [type, roomId, rooms]);

  const handleCreateSession = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    // Validation simple et claire
    if (!filmId || !roomId || !startTime) {
      setError("Merci de remplir le film, la room et l'heure de depart");
      setLoading(false);
      return;
    }

    try {
      const config = getAuthConfig();

      if (!config) {
        setError("Token introuvable. Merci de vous connecter.");
        setLoading(false);
        return;
      }

      const payload = {
        film_id: Number(filmId),
        room_id: Number(roomId),
        language: language,
        price: Number(price),
        start_time: startTime,
        type: type,
      };

      if (editingSessionId) {
        // Route backend: PUT /sessions/{id}
        await axios.put(`http://127.0.0.1:8000/api/sessions/${editingSessionId}`, payload, config);
        setMessage("Session modifiee avec succes");
      } else {
        // Route backend: POST /sessions
        await axios.post("http://127.0.0.1:8000/api/sessions", payload, config);
        setMessage("Session creee avec succes");
      }

      resetForm();

      loadBaseData();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la sauvegarde de la session");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSession = (session) => {
    // On charge les donnees de la session dans le formulaire
    setEditingSessionId(session.id);
    setFilmId(String(session.film_id || session.film?.id || ""));
    setRoomId(String(session.room_id || session.room?.id || ""));
    setLanguage(session.language || "ta3rabt");
    setPrice(session.price || 100);
    setStartTime(toDateTimeLocal(session.start_time));
    setType(session.type || "normal");
    setMessage("");
    setError("");
  };

  const handleCancelEdit = () => {
    resetForm();
    setMessage("");
    setError("");
  };

  const handleDeleteSession = async (sessionId) => {
    if (!confirm("Es-tu sur de vouloir supprimer cette session ?")) {
      return;
    }

    try {
      const config = getAuthConfig();

      if (!config) {
        setError("Token introuvable. Merci de vous connecter.");
        return;
      }

      // Route backend: DELETE /sessions/{id}
      await axios.delete(`http://127.0.0.1:8000/api/sessions/${sessionId}`, config);
      setMessage("Session supprimee avec succes");

      if (editingSessionId === sessionId) {
        handleCancelEdit();
      }

      loadBaseData();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la suppression de la session");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-6">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Gestion des sessions</h1>
        <p className="text-slate-600 mb-6">
          Etape 3: une session relie un film et une room avec l'heure, la langue et le prix.
        </p>

        {message && <p className="mb-4 text-green-700 bg-green-100 rounded-lg p-3">{message}</p>}
        {error && <p className="mb-4 text-red-700 bg-red-100 rounded-lg p-3">{error}</p>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-5 md:p-6">
            <div className="flex items-center justify-between gap-2 mb-4">
              <h2 className="text-xl font-semibold text-slate-800">
                {editingSessionId ? "Modifier la session" : "Creer une session"}
              </h2>

              {editingSessionId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-sm bg-slate-800 text-white px-3 py-2 rounded-lg hover:bg-slate-700"
                >
                  Annuler
                </button>
              )}
            </div>

            <form onSubmit={handleCreateSession} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-slate-700 font-medium">Film</label>
                <select
                  value={filmId}
                  onChange={(e) => setFilmId(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-3"
                >
                  <option value="">Choisir un film</option>
                  {films.map((film) => (
                    <option key={film.id} value={film.id}>
                      {film.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 text-slate-700 font-medium">Room</label>
                <select
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-3"
                >
                  <option value="">Choisir une room ({type})</option>
                  {filteredRooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name} ({room.type || "normal"})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  Seules les rooms du meme type que la session sont affichees.
                </p>
              </div>

              <div>
                <label className="block mb-1 text-slate-700 font-medium">Langue</label>
                <input
                  type="text"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-3"
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-700 font-medium">Prix</label>
                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-3"
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-700 font-medium">Date et heure</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-3"
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-700 font-medium">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-3"
                >
                  <option value="normal">Normal</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:bg-slate-400"
                >
                  {loading ? "Sauvegarde..." : editingSessionId ? "Modifier la session" : "Creer la session"}
                </button>
              </div>
            </form>

            {/* Explication simple */}
            <p className="text-sm text-slate-500 mt-4">
              Une session a besoin d'un film, d'une room et d'un horaire.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-5 md:p-6">
            <div className="flex items-center justify-between gap-2 mb-4">
              <h2 className="text-xl font-semibold text-slate-800">Liste des sessions</h2>
              <button
                onClick={loadBaseData}
                className="bg-slate-800 text-white px-3 py-2 rounded-lg hover:bg-slate-700"
              >
                Actualiser
              </button>
            </div>

            {loadingLists && <p className="text-slate-600">Chargement des donnees...</p>}

            {!loadingLists && sessions.length === 0 && (
              <p className="text-slate-600">Aucune session disponible pour le moment.</p>
            )}

            <div className="space-y-3">
              {sessions.map((session) => (
                <div key={session.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <p className="font-semibold text-slate-800">Session #{session.id}</p>
                  <p className="text-sm text-slate-600">Film: {session.film?.title || session.film_id || "-"}</p>
                  <p className="text-sm text-slate-600">Room: {session.room?.name || session.room_id || "-"}</p>
                  <p className="text-sm text-slate-600">Langue: {session.language || "-"}</p>
                  <p className="text-sm text-slate-600">Type: {session.type || "normal"}</p>
                  <p className="text-sm text-slate-600">Prix: {session.price || "-"} DT</p>
                  <p className="text-sm text-slate-600">Debut: {formatDateTime(session.start_time)}</p>

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditSession(session)}
                      className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Modifier
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteSession(session.id)}
                      className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 text-sm"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/*
  Mini glossaire (debutant):

  Session:
  - Projection d'un film dans une room a une heure donnee.

  film_id:
  - L'ID du film choisi.

  room_id:
  - L'ID de la room choisie.

  start_time:
  - Date et heure de debut de la session.

  formatDateTime:
  - Transforme la date en format lisible francais.
  - Exemple: 05/04/2026, 18:30.

  language:
  - Langue de la projection.

  price:
  - Prix d'un siege pour cette session.

  type:
  - normal ou VIP.

  editingSessionId:
  - Si different de null, le formulaire passe en mode modification.

  handleDeleteSession:
  - Supprime une session via DELETE /sessions/{id}.
*/
