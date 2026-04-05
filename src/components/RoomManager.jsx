import { useEffect, useState } from "react";
import axios from "axios";

export default function RoomManager() {
  // Etats du formulaire room
  const [name, setName] = useState("");
  const [type, setType] = useState("normal");
  const [capacity, setCapacity] = useState(15);
  const [editingRoomId, setEditingRoomId] = useState(null);

  // Etats pour la liste des rooms
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  // Etats UI simples
  const [loading, setLoading] = useState(false);
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

  const normalizeRooms = (data) => {
    const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

    return list;
  };

  const loadRooms = async () => {
    setLoadingRooms(true);
    setError("");

    try {
      const config = getAuthConfig();

      if (!config) {
        setError("Token introuvable. Merci de vous connecter.");
        return;
      }

      // Route backend: GET /rooms
      const response = await axios.get("http://127.0.0.1:8000/api/rooms", config);
      setRooms(normalizeRooms(response.data));
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de charger les rooms");
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleCreateRoom = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    // Validation tres simple
    if (!name || !capacity) {
      setError("Merci de remplir le nom et la capacite");
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
        name: name,
        type: type,
        capacity: Number(capacity),
      };

      if (editingRoomId) {
        // Route backend: PUT /rooms/{id}
        await axios.put(`http://127.0.0.1:8000/api/rooms/${editingRoomId}`, payload, config);
        setMessage("Room modifiee avec succes");
      } else {
        // Route backend: POST /rooms
        await axios.post("http://127.0.0.1:8000/api/rooms", payload, config);
        setMessage("Room creee avec succes");
      }

      setName("");
      setType("normal");
      setCapacity(15);
      setEditingRoomId(null);

      loadRooms();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la sauvegarde de la room");
    } finally {
      setLoading(false);
    }
  };

  const handleEditRoom = (room) => {
    // On remplit le formulaire avec la room choisie
    setEditingRoomId(room.id);
    setName(room.name || "");
    setType(room.type || "normal");
    setCapacity(room.capacity || 15);
    setMessage("");
    setError("");
  };

  const handleCancelEdit = () => {
    setEditingRoomId(null);
    setName("");
    setType("normal");
    setCapacity(15);
    setMessage("");
    setError("");
  };

  const handleDeleteRoom = async (roomId) => {
    if (!confirm("Es-tu sur de vouloir supprimer cette room ?")) {
      return;
    }

    try {
      const config = getAuthConfig();

      if (!config) {
        setError("Token introuvable. Merci de vous connecter.");
        return;
      }

      // Route backend: DELETE /rooms/{id}
      await axios.delete(`http://127.0.0.1:8000/api/rooms/${roomId}`, config);

      setMessage("Room supprimee avec succes");

      if (editingRoomId === roomId) {
        handleCancelEdit();
      }

      loadRooms();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la suppression de la room");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-6">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Gestion des rooms</h1>
        <p className="text-slate-600 mb-6">
          Etape 2: on cree d'abord les rooms avant de passer aux sessions.
        </p>

        {message && <p className="mb-4 text-green-700 bg-green-100 rounded-lg p-3">{message}</p>}
        {error && <p className="mb-4 text-red-700 bg-red-100 rounded-lg p-3">{error}</p>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-5 md:p-6">
            <div className="flex items-center justify-between gap-2 mb-4">
              <h2 className="text-xl font-semibold text-slate-800">
                {editingRoomId ? "Modifier la room" : "Creer une room"}
              </h2>

              {editingRoomId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-sm bg-slate-800 text-white px-3 py-2 rounded-lg hover:bg-slate-700"
                >
                  Annuler
                </button>
              )}
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block mb-1 text-slate-700 font-medium">Nom de la room</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Salle 1"
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

              <div>
                <label className="block mb-1 text-slate-700 font-medium">Capacite</label>
                <input
                  type="number"
                  min="1"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-3"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:bg-slate-400"
              >
                {loading ? "Sauvegarde..." : editingRoomId ? "Modifier la room" : "Creer la room"}
              </button>
            </form>

            {/* Explication simple */}
            <p className="text-sm text-slate-500 mt-4">
              Ici on envoie seulement le minimum necessaire: nom, type et capacite.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-5 md:p-6">
            <div className="flex items-center justify-between gap-2 mb-4">
              <h2 className="text-xl font-semibold text-slate-800">Liste des rooms</h2>
              <button
                onClick={loadRooms}
                className="bg-slate-800 text-white px-3 py-2 rounded-lg hover:bg-slate-700"
              >
                Actualiser
              </button>
            </div>

            {loadingRooms && <p className="text-slate-600">Chargement des rooms...</p>}

            {!loadingRooms && rooms.length === 0 && (
              <p className="text-slate-600">Aucune room disponible pour le moment.</p>
            )}

            <div className="space-y-3">
              {rooms.map((room) => (
                <div key={room.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <p className="font-semibold text-slate-800">{room.name}</p>
                  <p className="text-sm text-slate-600">Type: {room.type || "normal"}</p>
                  <p className="text-sm text-slate-600">Capacite: {room.capacity || "-"}</p>

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditRoom(room)}
                      className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Modifier
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteRoom(room.id)}
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

  Room:
  - Salle de cinema.
  - Ici on garde seulement: name, type, capacity.

  loadRooms:
  - Charge les rooms depuis GET /rooms.

  handleCreateRoom:
  - Envoie POST /rooms pour creer une nouvelle room.

  handleEditRoom:
  - Remplit le formulaire avec les donnees de la room choisie.

  handleDeleteRoom:
  - Supprime une room avec DELETE /rooms/{id}.

  editingRoomId:
  - Si different de null, le formulaire passe en mode modification.

  capacity:
  - Nombre de places disponibles dans la salle.

  type:
  - normal ou VIP.
*/