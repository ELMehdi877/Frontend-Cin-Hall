import { useEffect, useState } from "react";
import axios from "axios";

export default function CreateFilm() {
	// activeSection = menu actif dans la sidebar
	const [activeSection, setActiveSection] = useState("overview");

	// Etats du formulaire film
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [genre, setGenre] = useState("");
	const [actors, setActors] = useState("");
	const [durationMinutes, setDurationMinutes] = useState("");
	const [minimumAge, setMinimumAge] = useState(13);
	const [image, setImage] = useState("");
	const [trailerUrl, setTrailerUrl] = useState("");

	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [debugInfo, setDebugInfo] = useState("");

	// Etats pour la liste des films
	const [films, setFilms] = useState([]);
	const [loadingFilms, setLoadingFilms] = useState(false);
	const [filmsError, setFilmsError] = useState("");
	const [selectedFilm, setSelectedFilm] = useState(null);

	const getApiErrorMessage = (err) => {
		// Cas Laravel validation (422) avec "errors"
		const validationErrors = err.response?.data?.errors;
		if (validationErrors) {
			const firstKey = Object.keys(validationErrors)[0];
			if (firstKey && validationErrors[firstKey]?.length > 0) {
				return validationErrors[firstKey][0];
			}
		}

		// Message simple retourne par le backend
		if (err.response?.data?.message) {
			return err.response.data.message;
		}

		// Si l'API ne repond pas (serveur eteint, CORS, mauvaise URL...)
		if (err.request && !err.response) {
			return "API non joignable. Verifie que ton backend Laravel est bien demarre.";
		}

		return "Erreur lors de la creation du film";
	};

	const handleCreateFilm = async (e) => {
		e.preventDefault();

		setMessage("");
		setError("");
		setDebugInfo("");
		setLoading(true);

		// Validation simple (champs obligatoires)
		if (!title || !durationMinutes || !image || !trailerUrl) {
			setError("Merci de remplir les champs obligatoires");
			setLoading(false);
			return;
		}

		try {
			const token = localStorage.getItem("token");

			if (!token) {
				setError("Token introuvable. Connecte-toi d'abord.");
				setLoading(false);
				return;
			}

			// Envoi des donnees au backend
			const response = await axios.post(
				"http://127.0.0.1:8000/api/films",
				{
					title: title,
					description: description,
					genre: genre,
					actors: actors,
					duration_minutes: Number(durationMinutes),
					minimum_age: Number(minimumAge),
					image: image,
					trailer_url: trailerUrl,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			console.log(response.data);
			setMessage("Film cree avec succes");

			// Reset simple du formulaire
			setTitle("");
			setDescription("");
			setGenre("");
			setActors("");
			setDurationMinutes("");
			setMinimumAge(13);
			setImage("");
			setTrailerUrl("");

			// Recharge la liste apres creation
			fetchFilms();
		} catch (err) {
			const status = err.response?.status;
			const errorMessage = getApiErrorMessage(err);

			if (status === 401) {
				setError("Non autorise (401). Connecte-toi de nouveau.");
			} else if (status === 403) {
				setError("Acces refuse (403). Ce compte n'a pas la permission de creer un film.");
			} else {
				setError(errorMessage);
			}

			setDebugInfo(`Status: ${status || "inconnu"}`);
			console.log(err.response?.data);
		} finally {
			setLoading(false);
		}
	};

	const fetchFilms = async () => {
		setLoadingFilms(true);
		setFilmsError("");

		try {
			const token = localStorage.getItem("token");
			const headers = token ? { Authorization: `Bearer ${token}` } : {};

			// Recupere la liste des films depuis l'API
			const response = await axios.get("http://127.0.0.1:8000/api/films", {
				headers,
			});

			// On accepte plusieurs formats de reponse pour rester simple
			const data = response.data;
			if (Array.isArray(data)) {
				setFilms(data);
			} else if (Array.isArray(data?.data)) {
				setFilms(data.data);
			} else {
				setFilms([]);
			}
		} catch (err) {
			setFilmsError(err.response?.data?.message || "Impossible de charger les films");
		} finally {
			setLoadingFilms(false);
		}
	};

	const handleShowDetails = (film) => {
		// On memorise le film clique pour afficher ses details
		setSelectedFilm(film);
	};

	const handleDeleteFilm = async (filmId) => {
		// On demande une confirmation avant de supprimer
		if (!confirm("Es-tu sur de vouloir supprimer ce film ?")) {
			return;
		}

		try {
			const token = localStorage.getItem("token");

			if (!token) {
				setError("Token introuvable. Connecte-toi d'abord.");
				return;
			}

			// Envoi DELETE vers l'API
			await axios.delete(`http://127.0.0.1:8000/api/films/${filmId}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			// Ferme le detail et recharge la liste
			setSelectedFilm(null);
			setMessage("Film supprime avec succes");
			fetchFilms();
		} catch (err) {
			const status = err.response?.status;

			if (status === 403) {
				setError("Acces refuse (403). Seul un admin peut supprimer un film.");
			} else if (status === 404) {
				setError("Film introuvable (404).");
			} else {
				setError(err.response?.data?.message || "Erreur lors de la suppression");
			}

			console.log(err.response?.data);
		}
	};

	useEffect(() => {
		// Charge les films quand on ouvre la section Films
		if (activeSection === "films") {
			fetchFilms();
		}
	}, [activeSection]);

	return (
		<div className="min-h-screen bg-slate-100">
			<div className="max-w-6xl mx-auto p-4 md:p-6">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					{/* Sidebar */}
					<aside className="md:col-span-1 bg-slate-900 text-white rounded-xl p-4">
						<h2 className="text-lg font-bold mb-4">Dashboard</h2>

						<button
							onClick={() => setActiveSection("overview")}
							className="w-full text-left px-3 py-2 rounded-lg mb-2 bg-slate-800 hover:bg-slate-700"
						>
							Apercu
						</button>

						<button
							onClick={() => setActiveSection("films")}
							className="w-full text-left px-3 py-2 rounded-lg mb-2 bg-slate-800 hover:bg-slate-700"
						>
							Films
						</button>

						<button
							onClick={() => setActiveSection("reservations")}
							className="w-full text-left px-3 py-2 rounded-lg mb-2 bg-slate-800 hover:bg-slate-700"
						>
							Reservations
						</button>

						<button
							onClick={() => setActiveSection("profile")}
							className="w-full text-left px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700"
						>
							Profil
						</button>
					</aside>

					{/* Contenu */}
					<section className="md:col-span-3 bg-white rounded-xl shadow p-5 md:p-6">
						<h1 className="text-2xl font-bold text-slate-800">Bienvenue sur CinéHall</h1>
						<p className="text-slate-600 mt-1">
							Tableau de bord simple. On va ajouter les vraies donnees et pages petit a petit.
						</p>

						{activeSection === "overview" && (
							<div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
									<p className="text-sm text-slate-500">Films</p>
									<p className="text-2xl font-bold text-blue-700">0</p>
								</div>
								<div className="bg-green-50 border border-green-100 rounded-lg p-4">
									<p className="text-sm text-slate-500">Reservations</p>
									<p className="text-2xl font-bold text-green-700">0</p>
								</div>
							</div>
						)}

						{activeSection === "films" && (
							<div className="mt-6">
								<h3 className="text-xl font-semibold text-slate-800">Section Films</h3>
								<p className="text-slate-600 mt-2">
									Formulaire simple pour creer un film.
								</p>

								<button
									onClick={fetchFilms}
									className="mt-3 bg-slate-800 text-white px-3 py-2 rounded-lg hover:bg-slate-700"
								>
									Actualiser la liste
								</button>

								{message && (
									<p className="mt-4 mb-2 text-green-700 bg-green-100 rounded-lg p-3">{message}</p>
								)}

								{error && (
									<div className="mt-4 mb-2 text-red-700 bg-red-100 rounded-lg p-3">
										<p>{error}</p>
										{debugInfo && <p className="text-xs mt-1">{debugInfo}</p>}
									</div>
								)}

								<form onSubmit={handleCreateFilm} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
									<div className="md:col-span-2">
										<label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
										<input
											type="text"
											value={title}
											onChange={(e) => setTitle(e.target.value)}
											placeholder="Ex: Avengers"
											className="w-full border border-slate-300 rounded-lg p-2"
										/>
									</div>

									<div className="md:col-span-2">
										<label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
										<textarea
											value={description}
											onChange={(e) => setDescription(e.target.value)}
											placeholder="Description du film"
											rows={3}
											className="w-full border border-slate-300 rounded-lg p-2"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1">Genre</label>
										<input
											type="text"
											value={genre}
											onChange={(e) => setGenre(e.target.value)}
											placeholder="Action"
											className="w-full border border-slate-300 rounded-lg p-2"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1">Actors</label>
										<input
											type="text"
											value={actors}
											onChange={(e) => setActors(e.target.value)}
											placeholder="Acteur 1, Acteur 2"
											className="w-full border border-slate-300 rounded-lg p-2"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1">Duration minutes *</label>
										<input
											type="number"
											value={durationMinutes}
											onChange={(e) => setDurationMinutes(e.target.value)}
											placeholder="120"
											className="w-full border border-slate-300 rounded-lg p-2"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1">Minimum age</label>
										<input
											type="number"
											value={minimumAge}
											onChange={(e) => setMinimumAge(e.target.value)}
											className="w-full border border-slate-300 rounded-lg p-2"
										/>
									</div>

									<div className="md:col-span-2">
										<label className="block text-sm font-medium text-slate-700 mb-1">Image URL *</label>
										<input
											type="url"
											value={image}
											onChange={(e) => setImage(e.target.value)}
											placeholder="https://..."
											className="w-full border border-slate-300 rounded-lg p-2"
										/>
									</div>

									<div className="md:col-span-2">
										<label className="block text-sm font-medium text-slate-700 mb-1">Trailer URL *</label>
										<input
											type="url"
											value={trailerUrl}
											onChange={(e) => setTrailerUrl(e.target.value)}
											placeholder="https://youtube.com/..."
											className="w-full border border-slate-300 rounded-lg p-2"
										/>
									</div>

									<div className="md:col-span-2">
										<button
											type="submit"
											disabled={loading}
											className="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
										>
											{loading ? "Creation..." : "Creer Film"}
										</button>
									</div>
								</form>

								{selectedFilm && (
									<div className="mt-6 border border-blue-200 bg-blue-50 rounded-lg p-4">
										<div className="flex items-center justify-between gap-2">
											<h4 className="text-lg font-semibold text-slate-800">Details du film</h4>
											<button
												onClick={() => setSelectedFilm(null)}
												className="text-sm bg-slate-800 text-white px-3 py-1 rounded-md"
											>
												Fermer
											</button>
										</div>

										<p className="mt-3"><span className="font-medium">Titre:</span> {selectedFilm.title || "-"}</p>
										<p><span className="font-medium">Description:</span> {selectedFilm.description || "-"}</p>
										<p><span className="font-medium">Genre:</span> {selectedFilm.genre || "-"}</p>
										<p><span className="font-medium">Acteurs:</span> {selectedFilm.actors || "-"}</p>
										<p><span className="font-medium">Duree:</span> {selectedFilm.duration_minutes || "-"} min</p>
										<p><span className="font-medium">Age minimum:</span> {selectedFilm.minimum_age || "-"}</p>
										<p><span className="font-medium">Image:</span> {selectedFilm.image || "-"}</p>
										<p><span className="font-medium">Trailer:</span> {selectedFilm.trailer_url || "-"}</p>

										<div className="mt-4 flex gap-2">
											<button
												onClick={() => handleDeleteFilm(selectedFilm.id)}
												className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700"
											>
												Supprimer
											</button>
										</div>
									</div>
								)}

								<div className="mt-8">
									<h4 className="text-lg font-semibold text-slate-800">Liste des films</h4>

									{loadingFilms && (
										<p className="text-slate-600 mt-2">Chargement des films...</p>
									)}

									{filmsError && (
										<p className="mt-2 text-red-700 bg-red-100 rounded-lg p-3">{filmsError}</p>
									)}

									{!loadingFilms && !filmsError && films.length === 0 && (
										<p className="text-slate-600 mt-2">Aucun film pour le moment.</p>
									)}

									<div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
										{films.map((film) => (
											<div key={film.id} className="border border-slate-200 rounded-lg p-3 bg-slate-50">
												<p className="font-semibold text-slate-800">{film.title}</p>
												<p className="text-sm text-slate-600">Genre: {film.genre || "-"}</p>
												<p className="text-sm text-slate-600">Duree: {film.duration_minutes || "-"} min</p>
												<p className="text-sm text-slate-600">Age min: {film.minimum_age || "-"}</p>
												<button
													onClick={() => handleShowDetails(film)}
													className="mt-2 bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
												>
													Voir details
												</button>
											</div>
										))}
									</div>
								</div>
							</div>
						)}

						{activeSection === "reservations" && (
							<div className="mt-6">
								<h3 className="text-xl font-semibold text-slate-800">Section Reservations</h3>
								<p className="text-slate-600 mt-2">
									Ici on ajoutera la gestion des sieges et reservations.
								</p>
							</div>
						)}

						{activeSection === "profile" && (
							<div className="mt-6">
								<h3 className="text-xl font-semibold text-slate-800">Section Profil</h3>
								<p className="text-slate-600 mt-2">
									Ici on ajoutera les informations utilisateur.
								</p>
							</div>
						)}
					</section>
				</div>
			</div>
		</div>
	);
}

/*
  Mini glossaire (debutant):

  sidebar:
  - Colonne a gauche avec les boutons du menu.

  activeSection:
  - State qui contient la section active (overview, films, etc.).

  setActiveSection("films"):
  - Change la section active quand on clique un bouton.

  rendu conditionnel:
  - {activeSection === "films" && (...)}
  - Affiche le bloc seulement si la condition est vraie.

	handleCreateFilm:
	- Fonction appelee quand on envoie le formulaire film.

	Authorization Bearer token:
	- Le token JWT est envoye dans headers pour prouver que l'utilisateur est connecte.

	422 validation:
	- Erreur de validation backend (champ manque, format invalide...).
	- Ici on affiche le premier message utile.

	fetchFilms:
	- Fonction pour charger la liste des films depuis l'API.
	- Utilisee au clic sur "Actualiser" et apres creation.

	selectedFilm:
	- Film choisi dans la liste pour afficher ses details.

	handleShowDetails:
	- Fonction qui met le film clique dans selectedFilm.

	handleDeleteFilm:
	- Confirme puis envoie DELETE /api/films/{id}.
	- Recharge la liste apres suppression.
	- 403 = pas admin, 404 = film introuvable.

	useEffect:
	- Execute du code automatiquement quand une valeur change.
	- Ici: quand activeSection devient "films".

	champs obligatoires:
	- title, duration_minutes, image, trailer_url (selon ta migration).
*/
