import { Link, useNavigate } from "react-router-dom";

export default function PaymentCancel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-100 py-6">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow p-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Paiement annule</h1>
          <p className="text-slate-600">
            Aucun debit n'a ete finalise. Votre reservation reste en attente tant qu'elle n'est pas expiree.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/my-reservations")}
              className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700"
            >
              Revenir a mes reservations
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
