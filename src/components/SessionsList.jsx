import { useEffect, useState } from "react";
import axios from "axios";

export default function SessionsList({ filmId, onSelectSession }) {
	// Etats
	const [sessions, setSessions] = useState([]);
	const [loadingSessions, setLoadingSessions] = useState(false);
	const [sessionsError, setSessionsError] = useState("");
	const [typeFilter, setTypeFilter] = useState("ALL");

	const fetchSessions = async () => {
		if (!filmId) return;

		setLoadingSessions(true);
		setSessionsError("");

		try {
			const token = localStorage.getItem("token");
			const config = {
				params: {
					film_id: filmId,
				},
			};

			if (token) {
				config.headers = {
					Authorization: `Bearer ${token}`,
				};
			}

			// Recupere les sessions du film depuis l'API
			// On tente deux formats de reponse pour rester flexible
			const response = await axios.get("http://127.0.0.1:8000/api/sessions", config);

			// On accepte plusieurs formats
			const data = response.data;
			if (Array.isArray(data)) {
				setSessions(data);
			} else if (Array.isArray(data?.data)) {
				setSessions(data.data);
			} else {
				setSessions([]);
			}
		} catch (err) {
			setSessionsError(err.response?.data?.message || "Impossible de charger les seances");
		} finally {
			setLoadingSessions(false);
		}
	};

	// Charge les sessions au demarrage ou quand filmId change
	useEffect(() => {
		fetchSessions();
	}, [filmId]);

	// Formate la date simplement
	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("fr-FR") + " " + date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
	};

	// Couleur selon type de session
	const getTypeColor = (type) => {
		return type === "VIP" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800";
	};

	// On filtre localement pour garder le code simple
	const filteredSessions = sessions.filter((session) => {
		if (typeFilter === "ALL") {
			return true;
		}

		const normalizedType = String(session?.type || "").toUpperCase();
		return normalizedType === typeFilter;
	});

	return (
		<div className="mt-6">
			<h4 className="text-lg font-semibold text-slate-800 mb-4">Seances disponibles</h4>

			{/* Filtre du type de seance (cahier de charge) */}
			<div className="mb-4 flex items-center gap-2">
				<label className="text-sm text-slate-700 font-medium">Filtrer par type:</label>
				<select
					value={typeFilter}
					onChange={(e) => setTypeFilter(e.target.value)}
					className="border border-slate-300 rounded-md px-3 py-2 text-sm"
				>
					<option value="ALL">Toutes</option>
					<option value="NORMAL">Normale</option>
					<option value="VIP">VIP</option>
				</select>
			</div>

			{loadingSessions && (
				<p className="text-slate-600">Chargement des seances...</p>
			)}

			{sessionsError && (
				<p className="text-red-700 bg-red-100 rounded-lg p-3">{sessionsError}</p>
			)}

			{!loadingSessions && !sessionsError && sessions.length === 0 && (
				<p className="text-slate-600">Aucune seance disponible pour ce film.</p>
			)}

			{!loadingSessions && !sessionsError && sessions.length > 0 && filteredSessions.length === 0 && (
				<p className="text-slate-600">Aucune seance ne correspond a ce filtre.</p>
			)}

			{/* Affiche les seances en grille */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
				{filteredSessions.map((session) => (
					<div key={session.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
						<div className="flex items-center justify-between mb-2">
							<p className="font-semibold text-slate-800">{formatDate(session.start_time)}</p>
							<span className={`px-3 py-1 rounded-full text-sm font-semibold ${getTypeColor(session.type)}`}>
								{session.type}
							</span>
						</div>

						<p className="text-sm text-slate-600">Langue: {session.language || "-"}</p>
						<p className="text-sm text-slate-600">Salle: {session.room_id || "-"}</p>
						<p className="text-lg font-bold text-green-700 mt-2">{session.price} DT</p>

						{/* Bouton reserver */}
						<button
							onClick={() => onSelectSession && onSelectSession(session)}
							className="w-full mt-3 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition"
						>
							Reserver
						</button>
					</div>
				))}
			</div>
		</div>
	);
}

/*
  Mini glossaire (debutant):

  props (filmId, onSelectSession):
  - Parametres passes au composant par son parent.
  - filmId = l'ID du film pour charger ses seances.
  - onSelectSession = fonction appelee quand on clique "Reserver".

  params (dans axios.get):
  - Parametres d'URL de requete.
  - Exemple: ?film_id=5

  formatDate:
  - Transforme une date ISO en format lisible.
  - toLocaleDateString("fr-FR") pour le format francais.

  getTypeColor:
  - Retourne une couleur CSS selon le type (Normal/VIP).

	typeFilter:
	- Etat qui garde le filtre choisi par l'utilisateur.
	- Valeurs: ALL, NORMAL, VIP.

	filteredSessions:
	- Tableau des seances apres application du filtre.
	- Si ALL: on affiche toutes les seances.

  sessions.map((session) => ...):
  - Boucle sur chaque seance et l'affiche en carte.

  key={session.id}:
  - Identifiant unique pour chaque element.
  - React l'utilise pour optimiser l'affichage.

  session.type === "VIP":
  - Condition pour afficher la bonne couleur.

  onSelectSession && onSelectSession(session):
  - Appelle la fonction parent si elle existe.
  - Envoie la seance cliquee.
*/
