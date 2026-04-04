import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function BookingSeats() {
	const { sessionId } = useParams();
	const navigate = useNavigate();

	// Etats pour les sieges
	const [seats, setSeats] = useState([]);
	const [loadingSeats, setLoadingSeats] = useState(false);
	const [seatsError, setSeatsError] = useState("");

	// Etats pour la selection
	const [selectedSeats, setSelectedSeats] = useState([]);
	const [totalPrice, setTotalPrice] = useState(0);
	const [message, setMessage] = useState("");
	const [reservationStatus, setReservationStatus] = useState("");

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

	const normalizeSeats = (data) => {
		const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

		return list.map((seat, index) => {
			const row = seat.row || seat.row_label || "A";
			const number = Number(seat.number || seat.seat_number || index + 1);

			// id backend possible: id, seat_id ou seat.id
			const backendSeatId = seat.id ?? seat.seat_id ?? seat.seat?.id ?? null;

			return {
				id: backendSeatId,
				// Cle interne stable pour React + selection frontend
				seatKey: backendSeatId !== null ? `id-${backendSeatId}` : `pos-${row}-${number}-${index}`,
				row: row,
				number: number,
				status: seat.status || "available",
				price: Number(seat.price || 0),
				// On reste flexible selon le format backend
				isCouple:
					seat.is_couple === true ||
					String(seat.type || seat.seat_type || "").toLowerCase() === "couple",
			};
		});
	};

	const loadSeats = async () => {
		setLoadingSeats(true);
		setSeatsError("");
		setMessage("");

		try {
			const config = getAuthConfig();

			if (!config) {
				setSeatsError("Token introuvable. Merci de vous connecter.");
				navigate("/login");
				return;
			}

			// Route backend: GET /sessions/{session}/seats
			const response = await axios.get(
				`http://127.0.0.1:8000/api/sessions/${sessionId}/seats`,
				config
			);

			setSeats(normalizeSeats(response.data));
		} catch (err) {
			setSeatsError(err.response?.data?.message || "Impossible de charger les sieges de cette session");
		} finally {
			setLoadingSeats(false);
		}
	};

	const handleSelectSeat = (seat) => {
		// Si le siege est deja reserve, on ne peut pas le cliquer
		if (seat.status === "reserved") {
			return;
		}

		setMessage("");
		setReservationStatus("");

		const isAlreadySelected = selectedSeats.find((s) => s.seatKey === seat.seatKey);

		if (isAlreadySelected) {
			// Retire le siege
			setSelectedSeats(selectedSeats.filter((s) => s.seatKey !== seat.seatKey));
			return;
		}

		// Cas special siege couple: on reserve automatiquement 2 sieges (si possible)
		if (seat.isCouple) {
			const pairSeat = seats.find(
				(s) =>
					s.row === seat.row &&
					s.number === seat.number + 1 &&
					s.status !== "reserved" &&
					!selectedSeats.find((selected) => selected.seatKey === s.seatKey)
			);

			if (!pairSeat) {
				setMessage("Siege couple: le 2eme siege n'est pas disponible.");
				return;
			}

			setSelectedSeats([...selectedSeats, seat, pairSeat]);
			return;
		}

		// Siege standard: on ajoute simplement
		setSelectedSeats([...selectedSeats, seat]);
	};

	// Recalcule le prix total quand les sieges changent
	useEffect(() => {
		const sum = selectedSeats.reduce((acc, seat) => acc + Number(seat.price || 0), 0);

		// Si l'API ne renvoie pas de prix par siege, fallback simple a 50 DT
		if (sum === 0 && selectedSeats.length > 0) {
			setTotalPrice(selectedSeats.length * 50);
			return;
		}

		setTotalPrice(sum);
	}, [selectedSeats]);

	// Charge les sieges quand la page s'ouvre ou si sessionId change
	useEffect(() => {
		loadSeats();
	}, [sessionId]);

	const handleConfirmReservation = async () => {
		if (selectedSeats.length === 0) {
			alert("Merci de selectionner au moins un siege");
			return;
		}

		setMessage("");
		setReservationStatus("");

		try {
			const config = getAuthConfig();

			if (!config) {
				setSeatsError("Token introuvable. Merci de vous connecter.");
				navigate("/login");
				return;
			}

			const seatIds = selectedSeats
				.map((seat) => seat.id)
				.filter((id) => id !== null && id !== undefined);

			if (seatIds.length !== selectedSeats.length) {
				setSeatsError("Certains sieges n'ont pas d'identifiant backend. Impossible de reserver.");
				return;
			}

			// Route backend: POST /reservations
			const response = await axios.post(
				"http://127.0.0.1:8000/api/reservations",
				{
					session_id: Number(sessionId),
					seat_ids: seatIds,
				},
				config
			);

			const data = response.data?.data || response.data;
			setReservationStatus(data?.status || "reserved");
			setMessage("Reservation creee avec succes. Attention: elle expire dans 15 minutes si elle n'est pas payee.");
			setSelectedSeats([]);

			// Recharge les sieges pour voir l'etat mis a jour
			loadSeats();
		} catch (err) {
			setSeatsError(err.response?.data?.message || "Erreur lors de la creation de la reservation");
		}
	};

	// Retour a la liste des films
	const handleCancel = () => {
		navigate("/movies");
	};

	// Organisation simple des sieges par rangee
	const rows = [...new Set(seats.map((seat) => seat.row))];

	return (
		<div className="min-h-screen bg-slate-100 py-6">
			<div className="max-w-4xl mx-auto px-4 md:px-6">
				<h1 className="text-3xl font-bold text-slate-800 mb-2">Reservation de sieges</h1>
				<p className="text-slate-600 mb-6">
					Session #{sessionId} - Selectionnez vos sieges et confirmez la reservation.
				</p>

				{message && (
					<p className="mb-4 text-green-700 bg-green-100 rounded-lg p-3">{message}</p>
				)}

				{seatsError && (
					<p className="mb-4 text-red-700 bg-red-100 rounded-lg p-3">{seatsError}</p>
				)}

				{reservationStatus && (
					<p className="mb-4 text-blue-700 bg-blue-100 rounded-lg p-3">
						Statut reservation: <span className="font-semibold">{reservationStatus}</span>
					</p>
				)}

				<div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
					{/* Legende */}
					<div className="mb-6 flex flex-wrap gap-4 items-center justify-center">
						<div className="flex items-center gap-2">
							<div className="w-8 h-8 bg-green-500 rounded border border-green-600"></div>
							<span className="text-sm text-slate-700">Disponible</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-8 h-8 bg-red-500 rounded border border-red-600"></div>
							<span className="text-sm text-slate-700">Reserve</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-8 h-8 bg-blue-500 rounded border border-blue-600"></div>
							<span className="text-sm text-slate-700">Selectionne</span>
						</div>
					</div>

					{/* Grille de sieges */}
					<div className="bg-slate-50 p-4 md:p-6 rounded-lg mb-6 overflow-hidden">
						<p className="text-center text-slate-600 mb-4 font-semibold">Ecran</p>

						{loadingSeats && (
							<p className="text-slate-600 text-center mb-4">Chargement des sieges...</p>
						)}

						{!loadingSeats && rows.length === 0 && (
							<p className="text-slate-600 text-center mb-4">Aucun siege trouve pour cette session.</p>
						)}

						{/* On groupe par rangee */}
						{rows.map((row) => (
							<div key={row} className="mb-4 flex items-start gap-3">
								<span className="w-6 text-center font-bold text-slate-700">{row}</span>
								<div className="flex-1 overflow-x-auto pb-1">
									<div className="flex gap-2 min-w-max">
									{seats
										.filter((seat) => seat.row === row)
										.map((seat) => {
											const isSelected = selectedSeats.find((s) => s.seatKey === seat.seatKey);
											let bgColor = "bg-green-500 hover:bg-green-600 cursor-pointer";

											if (seat.status === "reserved") {
												bgColor = "bg-red-500 cursor-not-allowed opacity-50";
											} else if (isSelected) {
												bgColor = "bg-blue-500 hover:bg-blue-600 cursor-pointer";
											}

											return (
												<button
													key={seat.seatKey}
													onClick={() => handleSelectSeat(seat)}
													disabled={seat.status === "reserved"}
													className={`w-8 h-8 shrink-0 rounded border-2 border-slate-300 text-white text-xs font-bold transition ${bgColor}`}
													title={seat.isCouple ? "Siege couple" : "Siege standard"}
												>
													{seat.number}
												</button>
											);
										})}
									</div>
								</div>
							</div>
						))}
					</div>

					{/* Resume de la reservation */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
							<p className="text-sm text-slate-600">Sieges selectionnes</p>
							<p className="text-2xl font-bold text-blue-700">
								{selectedSeats.length}
							</p>
						</div>
						<div className="bg-green-50 border border-green-200 rounded-lg p-4">
							<p className="text-sm text-slate-600">Prix total calcule</p>
							<p className="text-2xl font-bold text-green-700">
								{totalPrice} DT
							</p>
						</div>
						<div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
							<p className="text-sm text-slate-600">Statut</p>
							<p className="text-2xl font-bold text-purple-700">
								{reservationStatus || "En attente"}
							</p>
						</div>
					</div>

					{/* Liste des sieges selectionnes */}
					{selectedSeats.length > 0 && (
						<div className="mb-6 p-4 bg-slate-100 rounded-lg">
							<p className="font-semibold text-slate-800 mb-2">Sieges selectionnes:</p>
							<p className="text-slate-700">
								{selectedSeats
									.map((s) => `${s.row}${s.number}${s.isCouple ? " (couple)" : ""}`)
									.join(", ")}
							</p>
						</div>
					)}

					{/* Boutons d'action */}
					<div className="flex flex-col sm:flex-row gap-3">
						<button
							onClick={handleCancel}
							className="flex-1 bg-slate-600 text-white px-4 py-3 rounded-lg hover:bg-slate-700 font-semibold"
						>
							Annuler
						</button>
						<button
							onClick={handleConfirmReservation}
							disabled={selectedSeats.length === 0}
							className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 font-semibold disabled:bg-slate-400 disabled:cursor-not-allowed"
						>
							Reserver maintenant
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

/*
  Mini glossaire (debutant):

  useParams:
  - Hook pour lire les parametres dans l'URL.
  - Exemple: /booking/5 -> sessionId = 5

  selectedSeats:
  - Array des sieges cliques par l'utilisateur.

	seats:
	- Liste des sieges charges depuis le backend.
	- Route utilisee: GET /sessions/{session}/seats.

	isCouple:
	- Booleen pour un siege couple.
	- Si true, on essaye d'ajouter automatiquement 2 sieges.

  status: available/reserved:
  - Etat du siege.
  - available = on peut le cliquer.
  - reserved = on ne peut pas (rouge, desactive).

  map:
  - Boucle pour afficher chaque siege.

  filter:
  - Filtre les sieges par rangee (A, B, etc.).

  isSelected:
  - Verifie si ce siege est dans selectedSeats.

  totalPrice:
	- Se recalcule automatiquement avec useEffect.
	- Utilise le prix des sieges; fallback a 50 DT si absent.

	handleConfirmReservation:
	- Envoie POST /reservations avec session_id et seat_ids.
	- Met a jour le message et le statut de reservation.

  disabled:
  - Desactive un bouton si une condition est vraie.
  - Exemple: disabled={selectedSeats.length === 0}
*/
