import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Confirmation du paiement en cours...");
  const [error, setError] = useState("");
  const [confirmedReservation, setConfirmedReservation] = useState(null);

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

  const reservationId = useMemo(() => {
    const fromUrl = searchParams.get("reservation_id");
    const fromStorage = localStorage.getItem("pending_payment_reservation_id");

    return fromUrl || fromStorage || "";
  }, [searchParams]);

  const stripeSessionId = useMemo(() => {
    return searchParams.get("session_id") || "";
  }, [searchParams]);

  const paymentIntentId = useMemo(() => {
    return searchParams.get("payment_intent") || "";
  }, [searchParams]);

  useEffect(() => {
    const confirmPayment = async () => {
      setLoading(true);
      setError("");

      try {
        const config = getAuthConfig();

        if (!config) {
          setError("Session expiree. Merci de vous reconnecter.");
          setLoading(false);
          return;
        }

        if (!reservationId) {
          setError("reservation_id manquant. Impossible de confirmer le paiement.");
          setLoading(false);
          return;
        }

        if (!stripeSessionId && !paymentIntentId) {
          setError("Identifiant Stripe manquant (session_id/payment_intent).");
          setLoading(false);
          return;
        }

        // Route backend: POST /payments/confirm
        const response = await axios.post(
          "http://127.0.0.1:8000/api/payments/confirm",
          {
            reservation_id: Number(reservationId),
            stripe_session_id: stripeSessionId || undefined,
            payment_intent_id: paymentIntentId || undefined,
          },
          config
        );

        setMessage(response.data?.message || "Paiement confirme avec succes.");
        setConfirmedReservation(response.data?.reservation || null);
        localStorage.removeItem("pending_payment_reservation_id");
      } catch (err) {
        setError(err.response?.data?.message || "Erreur lors de la confirmation du paiement");
      } finally {
        setLoading(false);
      }
    };

    confirmPayment();
  }, [paymentIntentId, reservationId, stripeSessionId]);

  return (
    <div className="min-h-screen bg-slate-100 py-6">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow p-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Paiement Stripe</h1>

          {loading && <p className="text-slate-600">{message}</p>}

          {!loading && error && (
            <div className="text-red-700 bg-red-100 rounded-lg p-4">
              <p className="font-semibold">Echec de confirmation</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="text-green-700 bg-green-100 rounded-lg p-4">
              <p className="font-semibold">Paiement confirme</p>
              <p className="text-sm mt-1">{message}</p>
            </div>
          )}

          {confirmedReservation && (
            <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-700">
              <p>
                <span className="font-semibold">Reservation:</span> #{confirmedReservation.id}
              </p>
              <p>
                <span className="font-semibold">Statut:</span> {confirmedReservation.status}
              </p>
              <p>
                <span className="font-semibold">Total:</span> {confirmedReservation.total_price} DT
              </p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/my-reservations")}
              className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700"
            >
              Retour a mes reservations
            </button>

            <Link
              to="/movies"
              className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50"
            >
              Retour aux films
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/*
  Mini glossaire (debutant):

  useSearchParams:
  - Permet de lire les query params de l'URL.
  - Exemple: ?session_id=cs_test_123

  /payments/confirm:
  - Endpoint backend qui finalise la reservation en paid.

  pending_payment_reservation_id:
  - Sauvegarde locale faite avant redirection Stripe.
  - Sert de fallback si reservation_id manque dans l'URL retour.
*/