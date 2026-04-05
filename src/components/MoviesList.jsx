import { useEffect, useState } from "react";
import axios from "axios";
import SessionsList from "./SessionsList";
import { useNavigate } from "react-router-dom";

export default function MoviesList() {
	// Etats
	const [films, setFilms] = useState([]);
	const [loadingFilms, setLoadingFilms] = useState(false);
	const [filmsError, setFilmsError] = useState("");
	const [selectedFilm, setSelectedFilm] = useState(null);
	const navigate = useNavigate();

	const fetchFilms = async () => {
		setLoadingFilms(true);
		setFilmsError("");

		try {
			// Recupere la liste des films depuis l'API (public, pas d'auth)
			const response = await axios.get("http://127.0.0.1:8000/api/films");

			// On accepte plusieurs formats de reponse
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

	// Charge les films au demarrage de la page
	useEffect(() => {
		fetchFilms();
	}, []);

	const handleShowDetails = (film) => {
		// On memorise le film clique pour afficher ses details
		setSelectedFilm(film);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const handleSelectSession = (session) => {
		// Important: on reserve une session (room_session), pas un film
		navigate(`/booking/${session.id}`);
	};

	return (
		<div className="min-h-screen bg-slate-100 py-6">
			<div className="max-w-6xl mx-auto px-4 md:px-6">
				<h1 className="text-3xl font-bold text-slate-800 mb-2">Les films disponibles</h1>
				<p className="text-slate-600 mb-6">
					Parcourez nos films et reussissez a reserver vos places.
				</p>

				{/* Affichage du detail du film */}
				{selectedFilm && (
					<div className="mb-6 border border-blue-200 bg-blue-50 rounded-lg p-4 md:p-6">
						<div className="flex items-center justify-between gap-2 mb-4">
							<h3 className="text-2xl font-semibold text-slate-800">Details du film</h3>
							<button
								onClick={() => setSelectedFilm(null)}
								className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700"
							>
								Fermer
							</button>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="md:col-span-1">
								{selectedFilm.image && (
									<img
										src={selectedFilm.image}
										alt={selectedFilm.title}
										className="w-full rounded-lg object-cover h-80"
									/>
								)}
							</div>

							<div className="md:col-span-2">
								<p className="text-lg"><span className="font-bold">Titre:</span> {selectedFilm.title || "-"}</p>
								<p className="text-base"><span className="font-bold">Description:</span> {selectedFilm.description || "-"}</p>
								<p><span className="font-bold">Genre:</span> {selectedFilm.genre || "-"}</p>
								<p><span className="font-bold">Acteurs:</span> {selectedFilm.actors || "-"}</p>
								<p><span className="font-bold">Duree:</span> {selectedFilm.duration_minutes || "-"} min</p>
								<p><span className="font-bold">Age minimum:</span> {selectedFilm.minimum_age || "-"} ans</p>

								{selectedFilm.trailer_url && (
									<p className="mt-2">
										<span className="font-bold">Bande-annonce:</span>{" "}
										<a
											href={selectedFilm.trailer_url}
											target="_blank"
											rel="noopener noreferrer"
											className="text-blue-600 underline hover:text-blue-800"
										>
											Voir la video
										</a>
									</p>
								)}
							</div>
						</div>

						{/* Liste des seances */}
						<SessionsList 
							filmId={selectedFilm.id} 
							onSelectSession={handleSelectSession}
						/>
					</div>
				)}

				{/* Affichage de la liste des films */}
				{loadingFilms && (
					<p className="text-slate-600 text-center py-6">Chargement des films...</p>
				)}

				{filmsError && (
					<p className="text-red-700 bg-red-100 rounded-lg p-4 text-center">{filmsError}</p>
				)}

				{!loadingFilms && !filmsError && films.length === 0 && (
					<p className="text-slate-600 text-center py-6">Aucun film disponible.</p>
				)}

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{films.map((film) => (
						<div
							key={film.id}
							className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
						>
							{/* Image du film */}
							{film.image && (
								<img
									src={film.image}
									alt={film.title}
									className="w-full h-48 object-cover"
								/>
							)}

							{/* Info du film */}
							<div className="p-4">
								<h3 className="text-lg font-semibold text-slate-800">{film.title}</h3>
								<p className="text-sm text-slate-600 mt-1">Genre: {film.genre || "-"}</p>
								<p className="text-sm text-slate-600">Duree: {film.duration_minutes || "-"} min</p>
								<p className="text-sm text-slate-600">Age min: {film.minimum_age || "-"}</p>

								{/* Bouton voir details */}
								<button
									onClick={() => handleShowDetails(film)}
									className="mt-3 w-full bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition"
								>
									Voir details
								</button>

								<p className="mt-2 text-xs text-slate-500">
									Choisis d'abord une seance dans les details du film.
								</p>
							</div>
						</div>
					))}
				</div>

				{/* Bouton actualiser */}
				<div className="mt-8 text-center">
					<button
						onClick={fetchFilms}
						className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700"
					>
						Actualiser la liste
					</button>
				</div>
			</div>
		</div>
	);
}