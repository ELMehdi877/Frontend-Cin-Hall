import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    // Validation tres simple cote frontend
    if (!name || !email || !password || !passwordConfirmation) {
      setError("Merci de remplir tous les champs");
      setLoading(false);
      return;
    }

    if (password !== passwordConfirmation) {
      setError("Les mots de passe ne sont pas identiques");
      setLoading(false);
      return;
    }

    try {
      // Envoi des donnees vers l'API
      const response = await axios.post("http://127.0.0.1:8000/api/register", {
        name: name,
        email: email,
        password: password,
        password_confirmation: passwordConfirmation,
      });

      setMessage("Inscription réussie");
      console.log(response.data);

      // Petite attente pour laisser voir le message puis redirection
      setTimeout(() => {
        navigate("/login");
      }, 800);
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur est survenue");
      console.log(err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">
          Create Account
        </h2>
        <p className="text-center text-slate-500 mb-6">
          Inscrivez-vous pour continuer
        </p>

        {message && (
          <p className="mb-4 text-green-600 bg-green-100 p-3 rounded-lg">
            {message}
          </p>
        )}

        {error && (
          <p className="mb-4 text-red-600 bg-red-100 p-3 rounded-lg">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-slate-700 font-medium">Name</label>
            <input
              type="text"
              placeholder="Entrer votre nom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-slate-700 font-medium">Email</label>
            <input
              type="email"
              placeholder="Entrer votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-slate-700 font-medium">Password</label>
            <input
              type="password"
              placeholder="Entrer votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-slate-700 font-medium">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Confirmer votre mot de passe"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition"
          >
            {loading ? "Inscription..." : "Register"}
          </button>

          <p className="text-center mt-4 text-sm text-slate-600">
            Vous avez deja un compte ?{" "}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

/*
  Mini glossaire (debutant):

  useState:
  - Hook React pour stocker une valeur dans le composant.
  - Exemple: const [email, setEmail] = useState("")

  loading:
  - Booleen (true/false) pour savoir si la requete est en cours.
  - true = on attend la reponse API, false = fini.

  Link:
  - Composant de react-router-dom.
  - Sert a naviguer vers une autre page sans recharger le navigateur.

  NavLink:
  - Comme Link, mais ajoute un style utile quand le lien est actif.
  - Tu l'utilises surtout dans la Navbar.

  useNavigate:
  - Hook react-router-dom pour changer de page avec du code JS.
  - Exemple: navigate("/login")

  handleSubmit:
  - Fonction appelee quand on envoie le formulaire.
  - Elle fait la validation puis l'appel API.

  axios.post(...):
  - Envoie des donnees au backend (API) en methode POST.

  e.preventDefault():
  - Empêche le rechargement automatique de la page au submit.

  onChange:
  - Evenement quand l'utilisateur tape dans un input.
  - Ici, on met a jour le state (setEmail, setPassword, etc.).

  value:
  - Valeur actuelle liee au state.
  - Input controle par React (controlled input).

  setTimeout:
  - Attend un peu (ici 800 ms) avant d'executer une action.

  try / catch / finally:
  - try: code principal (appel API)
  - catch: gestion erreur
  - finally: code execute dans tous les cas (ex: setLoading(false))
*/