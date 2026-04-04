import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function BookingSeats() {
	const { sessionId } = useParams();
	const navigate = useNavigate();

	// Etats
	const [selectedSeats, setSelectedSeats] = useState([]);
	const [totalPrice, setTotalPrice] = useState(0);

	// Pour cet exemple, on simule des sieges
	// Plus tard: charger depuis l'API GET /sessions/{sessionId}/seats
	const simulatedSeats = [
		{ id: 1, row: "A", number: 1, status: "available" },
		{ id: 2, row: "A", number: 2, status: "available" },
		{ id: 3, row: "A", number: 3, status: "reserved" },
		{ id: 4, row: "A", number: 4, status: "available" },
		{ id: 5, row: "A", number: 5, status: "available" },
		{ id: 6, row: "B", number: 1, status: "available" },
		{ id: 7, row: "B", number: 2, status: "available" },
		{ id: 8, row: "B", number: 3, status: "available" },
		{ id: 9, row: "B", number: 4, status: "reserved" },
		{ id: 10, row: "B", number: 5, status: "available" },
	];

	const pricePerSeat = 50; // A remplacer par le prix de la session

	const handleSelectSeat = (seat) => {
		// Si le siege est deja reserve, on ne peut pas le cliquer
		if (seat.status === "reserved") {
			return;
		}

		// On ajoute ou retire le siege de la selection
		if (selectedSeats.find((s) => s.id === seat.id)) {
			// Retire le siege
			setSelectedSeats(selectedSeats.filter((s) => s.id !== seat.id));
		} else {
			// Ajoute le siege
			setSelectedSeats([...selectedSeats, seat]);
		}
	};

	// Recalcule le prix total quand les sieges changent
	useEffect(() => {
		setTotalPrice(selectedSeats.length * pricePerSeat);
	}, [selectedSeats]);

	const handleConfirmReservation = () => {
		if (selectedSeats.length === 0) {
			alert("Merci de selectionner au moins un siege");
			return;
		}

		// Plus tard: envoyer POST /reservations avec selectedSeats
		console.log("Reservation confirmee:", selectedSeats);
		alert(`${selectedSeats.length} siege(s) reserve(s) pour ${totalPrice} DT`);
	};

	// Retour a la liste des films
	const handleCancel = () => {
		navigate("/movies");
	};

	return (
		<div className="min-h-screen bg-slate-100 py-6">
			<div className="max-w-4xl mx-auto px-4 md:px-6">
				<h1 className="text-3xl font-bold text-slate-800 mb-2">Reservation de sieges</h1>
				<p className="text-slate-600 mb-6">
					Session #{sessionId} - Selectionnez vos sieges et confirmez la reservation.
				</p>

				<div className="bg-white rounded-lg shadow-lg p-6">
					{/* Legende */}
					<div className="mb-6 flex gap-4 items-center justify-center">
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
					<div className="bg-slate-50 p-6 rounded-lg mb-6">
						<p className="text-center text-slate-600 mb-4 font-semibold">Ecran</p>

						{/* On groupe par rangee */}
						{["A", "B"].map((row) => (
							<div key={row} className="mb-4 flex items-center gap-3">
								<span className="w-6 text-center font-bold text-slate-700">{row}</span>
								<div className="flex gap-2">
									{simulatedSeats
										.filter((seat) => seat.row === row)
										.map((seat) => {
											const isSelected = selectedSeats.find((s) => s.id === seat.id);
											let bgColor = "bg-green-500 hover:bg-green-600 cursor-pointer";

											if (seat.status === "reserved") {
												bgColor = "bg-red-500 cursor-not-allowed opacity-50";
											} else if (isSelected) {
												bgColor = "bg-blue-500 hover:bg-blue-600 cursor-pointer";
											}

											return (
												<button
													key={seat.id}
													onClick={() => handleSelectSeat(seat)}
													disabled={seat.status === "reserved"}
													className={`w-8 h-8 rounded border-2 border-slate-300 text-white text-xs font-bold transition ${bgColor}`}
												>
													{seat.number}
												</button>
											);
										})}
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
							<p className="text-sm text-slate-600">Prix unitaire</p>
							<p className="text-2xl font-bold text-green-700">
								{pricePerSeat} DT
							</p>
						</div>
						<div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
							<p className="text-sm text-slate-600">Total</p>
							<p className="text-2xl font-bold text-purple-700">
								{totalPrice} DT
							</p>
						</div>
					</div>

					{/* Liste des sieges selectionnes */}
					{selectedSeats.length > 0 && (
						<div className="mb-6 p-4 bg-slate-100 rounded-lg">
							<p className="font-semibold text-slate-800 mb-2">Sieges selectionnes:</p>
							<p className="text-slate-700">
								{selectedSeats.map((s) => `${s.row}${s.number}`).join(", ")}
							</p>
						</div>
					)}

					{/* Boutons d'action */}
					<div className="flex gap-3">
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
							Confirmer la reservation
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

  simulatedSeats:
  - Pour cet exemple, on simule des sieges.
  - Plus tard: charger depuis l'API.

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

  disabled:
  - Desactive un bouton si une condition est vraie.
  - Exemple: disabled={selectedSeats.length === 0}
*/
