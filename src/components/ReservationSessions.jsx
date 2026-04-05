import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function ReservationSessions() {
  const navigate = useNavigate();

  // Donnees API
  const [sessions, setSessions] = useState([]);
  const [films, setFilms] = useState([]);
  const [rooms, setRooms] = useState([]);

  // Etats UI
  const [loading, setLoading] = useState(false);
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

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const config = getAuthConfig();

      if (!config) {
        setError("Token introuvable. Merci de vous connecter.");
        navigate("/login");
        return;
      }

      // On charge tout pour afficher chaque session avec son film + sa room
      const [sessionsResponse, filmsResponse, roomsResponse] = await Promise.all([
        axios.get("http://127.0.0.1:8000/api/sessions", config),
        axios.get("http://127.0.0.1:8000/api/films", config),
        axios.get("http://127.0.0.1:8000/api/rooms", config),
      ]);

      setSessions(normalizeList(sessionsResponse.data));
      setFilms(normalizeList(filmsResponse.data));
      setRooms(normalizeList(roomsResponse.data));
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de charger les sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getFilmTitle = (session) => {
    if (session?.film?.title) {
      return session.film.title;
    }

    const film = films.find((item) => String(item.id) === String(session.film_id));
    return film?.title || "Film inconnu";
  };

  const getRoomName = (session) => {
    if (session?.room?.name) {
      return session.room.name;
    }

    const room = rooms.find((item) => String(item.id) === String(session.room_id));
    return room?.name || "Room inconnue";
  };

  const openReservation = (session) => {
    // On reserve une session (room_session)
    navigate(`/booking/${session.id}`);
  };

  return (
    <div className="min-h-screen bg-slate-100 py-6">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Choisir une session</h1>
        <p className="text-slate-600 mb-6">
          Etape reservation: afficher les sessions avec leur film, leur room et leur type.
        </p>

        {error && <p className="mb-4 text-red-700 bg-red-100 rounded-lg p-3">{error}</p>}

        <div className="mb-4">
          <button
            onClick={loadData}
            className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700"
          >
            Actualiser
          </button>
        </div>

        {loading && <p className="text-slate-600">Chargement des sessions...</p>}

        {!loading && sessions.length === 0 && (
          <p className="text-slate-600">Aucune session disponible pour le moment.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.map((session) => (
            <div key={session.id} className="bg-white rounded-xl shadow border border-slate-200 p-4">
              <p className="text-lg font-semibold text-slate-800">Session #{session.id}</p>
              <p className="text-sm text-slate-600 mt-2">
                <span className="font-medium">Film:</span> {getFilmTitle(session)}
              </p>
              <p className="text-sm text-slate-600">
                <span className="font-medium">Room:</span> {getRoomName(session)}
              </p>
              <p className="text-sm text-slate-600">
                <span className="font-medium">Type:</span> {session.type || "normal"}
              </p>
              <p className="text-sm text-slate-600">
                <span className="font-medium">Langue:</span> {session.language || "-"}
              </p>
              <p className="text-sm text-slate-600">
                <span className="font-medium">Debut:</span> {formatDateTime(session.start_time)}
              </p>
              <p className="text-lg font-bold text-green-700 mt-2">{session.price || "-"} DT</p>

              <button
                type="button"
                onClick={() => openReservation(session)}
                className="mt-3 w-full bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700"
              >
                Reserver cette session
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/*
  Mini glossaire (debutant):

  Session:
  - Projection liee a un film et une room.

  room_session:
  - Nom backend de la session de projection.
  - Ici on reserve via l'id de session.

  getFilmTitle / getRoomName:
  - Fonctions qui retrouvent le nom du film et de la room.
  - Utiles si l'API retourne seulement film_id/room_id.

  openReservation:
  - Ouvre la page de reservation des sieges pour la session choisie.
*/
