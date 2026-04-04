import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Navbar() {
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem("token");

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem("token");

            if (token) {
                // Route backend: POST /logout
                await axios.post("http://127.0.0.1:8000/api/logout", {}, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            }
        } catch (error) {
            // Meme si l'API echoue, on coupe la session locale
            console.log(error.response?.data);
        } finally {
            // On supprime le token puis on revient a login
            localStorage.removeItem("token");
            navigate("/login");
        }
    };

    return <nav className="bg-slate-900 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold">CineHall</h1>

            <div className="flex gap-4 items-center">
                <NavLink to="/movies" className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition">Films</NavLink>

                {!isLoggedIn && (
                    <>
                        <NavLink to="/login" className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 transition">Login</NavLink>
                        <NavLink to="/register" className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 transition">Register</NavLink>
                    </>
                )}

                {isLoggedIn && (
                    <>
                        <NavLink to="/dashboard" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition">Dashboard</NavLink>
                        <NavLink to="/profile" className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition">Profil</NavLink>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition"
                        >
                            Logout
                        </button>
                    </>
                )}
            </div>
        </div>
    </nav>
}

/*
    Mini glossaire (debutant):

    NavLink:
    - Lien de navigation React Router.
    - Pratique pour les menus (Navbar).

    useNavigate:
    - Hook pour rediriger avec du code JavaScript.
    - Exemple: navigate("/login")

    isLoggedIn:
    - Variable booleenne (true/false).
    - Ici: true si un token existe dans localStorage.

    !!valeur:
    - Transforme une valeur en vrai booleen.
    - Exemple: !!localStorage.getItem("token")

    localStorage:
    - Stockage simple dans le navigateur.
    - getItem("token") pour lire.
    - removeItem("token") pour supprimer.

    handleLogout:
    - Fonction executee quand on clique sur Logout.
    - Elle supprime le token puis redirige.

    Rendu conditionnel:
    - {!isLoggedIn && (...)} -> afficher si NON connecte
    - {isLoggedIn && (...)} -> afficher si connecte
*/