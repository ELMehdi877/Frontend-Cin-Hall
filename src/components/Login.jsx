import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");
        setLoading(true);

        // Validation simple avant appel API
        if (!email || !password) {
            setError("Merci de remplir email et mot de passe");
            setLoading(false);
            return;
        }
        
        try {
            const response = await axios.post("http://127.0.0.1:8000/api/login", {
                email: email,
                password: password,
            });

            // On garde le token pour les pages protégées
            localStorage.setItem("token", response.data.token);
            setMessage("Login réussi")
            console.log(response.data);

            // Redirection vers la page protégée
            navigate("/dashboard");

        } catch (error) {
            setError(error.response?.data?.message || "Email ou mot de passe incorrect")
            console.log(error.response.data);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">Welcome back</h2>
                <p className="text-center text-slate-500 mb-6">
                    Connectez-vous à votre compte
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
                    <label className="block mb-1 text-slate-700 font-medium">Email</label>
                    <input type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    
                    <br />

                    <label className="block mb-1 text-slate-700 font-medium">Password</label>
                    <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <br />

                    <p className="text-center mt-4 text-sm text-slate-600">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-blue-600 font-medium hover:underline">
                        Register
                    </Link>
                    </p>

                    <br />

                    <button type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition"
                    >{loading ? "Connexion..." : "Login"}</button>
                </form>
            </div>

        </div>
    );

}
export default Login

/*
    Mini glossaire (debutant):

    loading:
    - Etat true/false pour dire: "la requete API est en cours".
    - Si loading = true, on peut desactiver le bouton.

    useState:
    - Hook React pour memoriser une valeur dans le composant.
    - Exemple: email, password, error...

    Link:
    - Composant react-router-dom pour changer de page sans recharger.

    NavLink:
    - Variante de Link (souvent dans Navbar) avec style actif.

    useNavigate:
    - Hook react-router-dom pour redirection avec JavaScript.
    - Exemple: navigate("/create-film")

    handleSubmit:
    - Fonction executee quand on clique sur Login.
    - Elle valide les champs puis appelle l'API.

    axios.post:
    - Envoie les donnees au backend avec la methode POST.

    localStorage:
    - Petit stockage dans le navigateur.
    - Ici on sauvegarde le token JWT: localStorage.setItem("token", ...)

    e.preventDefault():
    - Evite le rechargement automatique de la page lors du submit.

    try / catch / finally:
    - try: tentative de connexion
    - catch: gestion de l'erreur
    - finally: actions a faire dans tous les cas (setLoading(false))
*/