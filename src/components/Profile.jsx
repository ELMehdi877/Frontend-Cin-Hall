import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Profile() {
  const navigate = useNavigate();

  // Infos utilisateur retournees par GET /user
  const [user, setUser] = useState(null);

  // Etats du formulaire modification
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Etats UI
  const [loadingUser, setLoadingUser] = useState(false);
  const [saving, setSaving] = useState(false);
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

  const loadUserProfile = async () => {
    setLoadingUser(true);
    setMessage("");
    setError("");

    try {
      const config = getAuthConfig();

      if (!config) {
        setError("Token introuvable. Merci de vous connecter.");
        navigate("/login");
        return;
      }

      // Route backend: GET /user
      const response = await axios.get("http://127.0.0.1:8000/api/user", config);

      const data = response.data?.data || response.data;
      setUser(data);
      setName(data?.name || "");
      setEmail(data?.email || "");
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de charger le profil utilisateur");
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!name || !email) {
      setError("Merci de remplir le nom et l'email");
      return;
    }

    setSaving(true);

    try {
      const config = getAuthConfig();

      if (!config) {
        setError("Token introuvable. Merci de vous connecter.");
        navigate("/login");
        return;
      }

      // Route backend: PUT /user
      const response = await axios.put(
        "http://127.0.0.1:8000/api/user",
        {
          name: name,
          email: email,
        },
        config
      );

      const data = response.data?.data || response.data;
      setUser(data);
      setMessage("Profil mis a jour avec succes");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la mise a jour du profil");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setMessage("");
    setError("");

    try {
      const config = getAuthConfig();

      if (config) {
        // Route backend: POST /logout
        await axios.post("http://127.0.0.1:8000/api/logout", {}, config);
      }
    } catch (err) {
      // Meme en cas d'erreur backend, on nettoie la session locale
      console.log(err.response?.data);
    } finally {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-6">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Mon profil</h1>
        <p className="text-slate-600 mb-6">Consulter et modifier vos informations personnelles.</p>

        {message && (
          <p className="mb-4 text-green-700 bg-green-100 rounded-lg p-3">{message}</p>
        )}

        {error && (
          <p className="mb-4 text-red-700 bg-red-100 rounded-lg p-3">{error}</p>
        )}

        <div className="bg-white rounded-xl shadow p-5 md:p-6">
          {loadingUser ? (
            <p className="text-slate-600">Chargement du profil...</p>
          ) : (
            <>
              <div className="mb-5 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-500">Informations actuelles</p>
                <p className="text-slate-800 mt-1">
                  <span className="font-semibold">Nom:</span> {user?.name || "-"}
                </p>
                <p className="text-slate-800">
                  <span className="font-semibold">Email:</span> {user?.email || "-"}
                </p>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block mb-1 text-slate-700 font-medium">Nom</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-3"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-slate-700 font-medium">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-3"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    {saving ? "Sauvegarde..." : "Mettre a jour"}
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Se deconnecter
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/*
  Mini glossaire (debutant):

  user:
  - Objet des informations utilisateur (name, email...).

  loadUserProfile:
  - Fonction qui appelle GET /user pour charger les infos du compte.

  handleUpdateProfile:
  - Fonction du formulaire qui appelle PUT /user.

  handleLogout:
  - Appelle POST /logout puis supprime le token local.

  getAuthConfig:
  - Petite fonction utilitaire qui prepare le header Authorization.

  response.data?.data || response.data:
  - Accepte deux formats possibles de reponse API.
*/
