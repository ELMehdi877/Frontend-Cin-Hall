import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Navbar({ isCollapsed = false, onToggleCollapse = () => {} }) {
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem("token");

    const navItemClass = ({ isActive }) => {
        const baseClass = isCollapsed
            ? "px-2 py-2 rounded-lg transition md:w-full md:text-center"
            : "px-4 py-2 rounded-lg transition md:w-full md:text-left";

        return isActive
            ? `${baseClass} bg-blue-600 text-white`
            : `${baseClass} bg-slate-700 text-slate-100 hover:bg-slate-600`;
    };

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

    return <nav className={`bg-slate-900 text-white shadow-md md:fixed md:inset-y-0 md:left-0 md:shadow-xl ${isCollapsed ? "md:w-20" : "md:w-64"}`}>
        <div className="px-4 py-4 md:h-full md:flex md:flex-col">
            <div className="flex items-center justify-between">
                <h1 className={`text-xl font-bold px-2 ${isCollapsed ? "md:hidden" : ""}`}>CineHall</h1>

                <button
                    type="button"
                    onClick={onToggleCollapse}
                    className="hidden md:inline-flex items-center justify-center text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded"
                    title={isCollapsed ? "Ouvrir la sidebar" : "Reduire la sidebar"}
                >
                    {isCollapsed ? ">>" : "<<"}
                </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 md:mt-6 md:flex-col md:gap-3">
                <NavLink to="/movies" className={navItemClass}>{isCollapsed ? "F" : "Films"}</NavLink>

                {!isLoggedIn && (
                    <>
                        <NavLink to="/login" className={navItemClass}>{isCollapsed ? "L" : "Login"}</NavLink>
                        <NavLink to="/register" className={navItemClass}>{isCollapsed ? "R" : "Register"}</NavLink>
                    </>
                )}

                {isLoggedIn && (
                    <>
                        <NavLink to="/dashboard" className={navItemClass}>{isCollapsed ? "D" : "Dashboard"}</NavLink>
                        <NavLink to="/rooms" className={navItemClass}>{isCollapsed ? "Rm" : "Rooms"}</NavLink>
                        <NavLink to="/sessions-manager" className={navItemClass}>{isCollapsed ? "S" : "Sessions"}</NavLink>
                        <NavLink to="/profile" className={navItemClass}>{isCollapsed ? "P" : "Profil"}</NavLink>
                        <button
                            onClick={handleLogout}
                            className={`py-2 rounded-lg bg-red-600 hover:bg-red-700 transition md:w-full ${isCollapsed ? "px-2 md:text-center" : "px-4 md:text-left"}`}
                        >
                            {isCollapsed ? "Out" : "Logout"}
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