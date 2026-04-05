import { useEffect, useState } from "react";
import axios from "axios";

export default function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [checkoutDebug, setCheckoutDebug] = useState(null);

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

  const normalizeList = (data) => {
    return Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  };

  const extractApiErrorMessage = (err, fallbackMessage) => {
    const status = err?.response?.status;
    const data = err?.response?.data;

    if (data?.error_code === "STRIPE_CONFIG_MISSING") {
      const missingKeys = Array.isArray(data?.missing) ? data.missing.join(", ") : "STRIPE_SECRET";
      const baseMessage = `Configuration Stripe manquante cote backend: ${missingKeys}`;
      return status ? `${baseMessage} (HTTP ${status})` : baseMessage;
    }

    if (data?.message) {
      return status ? `${data.message} (HTTP ${status})` : data.message;
    }

    if (typeof data?.error === "string" && data.error.trim()) {
      return status ? `${data.error} (HTTP ${status})` : data.error;
    }

    if (data?.errors && typeof data.errors === "object") {
      const validationMessages = Object.values(data.errors)
        .flat()
        .filter(Boolean)
        .join(" | ");

      if (validationMessages) {
        return status ? `${validationMessages} (HTTP ${status})` : validationMessages;
      }
    }

    return status ? `${fallbackMessage} (HTTP ${status})` : fallbackMessage;
  };

  const formatDateTime = (value) => {
    if (!value) {
      return "-";
    }

    const parsedDate = new Date(String(value).replace(" ", "T"));
    if (Number.isNaN(parsedDate.getTime())) {
      return value;
    }

    return parsedDate.toLocaleString("fr-FR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadgeClass = (status) => {
    const normalized = String(status || "").toLowerCase();

    if (normalized === "paid") {
      return "bg-green-100 text-green-700";
    }

    if (normalized === "cancelled") {
      return "bg-red-100 text-red-700";
    }

    if (normalized === "expired") {
      return "bg-slate-200 text-slate-700";
    }

    return "bg-yellow-100 text-yellow-700";
  };

  const loadReservations = async () => {
    setLoading(true);
    setError("");
    setCheckoutDebug(null);

    try {
      const config = getAuthConfig();

      if (!config) {
        setError("Token introuvable. Merci de vous connecter.");
        setLoading(false);
        return;
      }

      // Route backend: GET /reservations
      const response = await axios.get("http://127.0.0.1:8000/api/reservations", config);
      setReservations(normalizeList(response.data));
    } catch (err) {
      setError(extractApiErrorMessage(err, "Impossible de charger vos reservations"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const handleCancelReservation = async (reservationId) => {
    if (!confirm("Voulez-vous annuler cette reservation ?")) {
      return;
    }

    setMessage("");
    setError("");
    setCheckoutDebug(null);

    try {
      const config = getAuthConfig();

      if (!config) {
        setError("Token introuvable. Merci de vous connecter.");
        return;
      }

      // Route backend: PATCH /reservations/{id}/cancel
      await axios.patch(
        `http://127.0.0.1:8000/api/reservations/${reservationId}/cancel`,
        {},
        config
      );

      setMessage("Reservation annulee avec succes");
      loadReservations();
    } catch (err) {
      setError(extractApiErrorMessage(err, "Erreur lors de l'annulation de la reservation"));
    }
  };

  const handlePayReservation = async (reservation) => {
    setMessage("");
    setError("");
    setCheckoutDebug(null);

    try {
      const config = getAuthConfig();

      if (!config) {
        setError("Token introuvable. Merci de vous connecter.");
        return;
      }

      // Sauvegarde locale pour recuperer l'id reservation au retour Stripe.
      localStorage.setItem("pending_payment_reservation_id", String(reservation.id));

      // Route backend: POST /payments/checkout-session
      const response = await axios.post(
        "http://127.0.0.1:8000/api/payments/checkout-session",
        {
          reservation_id: reservation.id,
        },
        config
      );

      const checkoutUrl = response.data?.checkout_url;

      if (!checkoutUrl) {
        setError("Lien Stripe introuvable dans la reponse backend.");
        return;
      }

      window.location.href = checkoutUrl;
    } catch (err) {
      localStorage.removeItem("pending_payment_reservation_id");

      // Si le backend renvoie 409 (expired/cancelled/paid), on recharge pour rafraichir le statut local.
      if (err?.response?.status === 409) {
        loadReservations();
      }

      if (err?.response?.status === 500) {
        setCheckoutDebug({
          endpoint: "POST /api/payments/checkout-session",
          reservationId: reservation?.id || null,
          status: 500,
          at: new Date().toISOString(),
        });
      }

      setError(extractApiErrorMessage(err, "Impossible de demarrer le paiement Stripe"));
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-6">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Mes reservations</h1>
        <p className="text-slate-600 mb-6">Consulter vos reservations et annuler celles qui sont en attente.</p>

        {message && <p className="mb-4 text-green-700 bg-green-100 rounded-lg p-3">{message}</p>}
        {error && <p className="mb-4 text-red-700 bg-red-100 rounded-lg p-3">{error}</p>}

        {checkoutDebug && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900 text-sm">
            <p className="font-semibold">Debug paiement (a transmettre au backend)</p>
            <p>endpoint: {checkoutDebug.endpoint}</p>
            <p>reservation_id: {checkoutDebug.reservationId || "-"}</p>
            <p>status: {checkoutDebug.status}</p>
            <p>timestamp: {checkoutDebug.at}</p>
          </div>
        )}

        <div className="mb-4">
          <button
            type="button"
            onClick={loadReservations}
            className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700"
          >
            Actualiser
          </button>
        </div>

        {loading && <p className="text-slate-600">Chargement de vos reservations...</p>}

        {!loading && reservations.length === 0 && (
          <p className="text-slate-600">Aucune reservation pour le moment.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reservations.map((reservation) => {
            const status = reservation.status || "pending";
            const canCancel = String(status).toLowerCase() === "pending";
            const canPay = String(status).toLowerCase() === "pending";
            const seatsCount = Array.isArray(reservation.seats) ? reservation.seats.length : "-";

            return (
              <div key={reservation.id} className="bg-white border border-slate-200 rounded-xl shadow p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-lg font-semibold text-slate-800">Reservation #{reservation.id}</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeClass(status)}`}>
                    {status}
                  </span>
                </div>

                <p className="text-sm text-slate-600 mt-2">
                  <span className="font-medium">Session:</span> {reservation.room_session_id || "-"}
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Nombre de sieges:</span> {seatsCount}
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Total:</span> {reservation.total_price || 0} DT
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Expire le:</span> {formatDateTime(reservation.expires_at)}
                </p>

                {(canPay || canCancel) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {canPay && (
                      <button
                        type="button"
                        onClick={() => handlePayReservation(reservation)}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
                      >
                        Payer maintenant
                      </button>
                    )}

                    {canCancel && (
                      <button
                        type="button"
                        onClick={() => handleCancelReservation(reservation.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                      >
                        Annuler reservation
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/*
  Mini glossaire (debutant):

  reservation.status:
  - Etat d'une reservation (pending, paid, cancelled, expired).

  canCancel:
  - true seulement si status = pending.
  - Dans ce cas, on affiche le bouton d'annulation.

  handleCancelReservation:
  - Appelle PATCH /reservations/{id}/cancel.

  handlePayReservation:
  - Appelle POST /payments/checkout-session.
  - Redirige l'utilisateur vers Stripe Checkout.

  loadReservations:
  - Charge la liste des reservations depuis GET /reservations.
*/
