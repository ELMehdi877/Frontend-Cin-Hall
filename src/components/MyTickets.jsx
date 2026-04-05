import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";

export default function MyTickets() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [printingTicketId, setPrintingTicketId] = useState(null);

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

    if (data?.message) {
      return status ? `${data.message} (HTTP ${status})` : data.message;
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

  const loadReservations = async () => {
    setLoading(true);
    setError("");

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
      setError(extractApiErrorMessage(err, "Impossible de charger les tickets"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const paidReservations = useMemo(() => {
    return reservations.filter((reservation) => String(reservation.status || "").toLowerCase() === "paid");
  }, [reservations]);

  const buildTicketPayload = (reservation) => {
    return {
      ticket_number: `CH-${reservation.id}`,
      reservation_id: reservation.id,
      room_session_id: reservation.room_session_id,
      total_price: reservation.total_price,
      payment_reference: reservation.payment_reference || "-",
      paid_at: reservation.paid_at || "-",
    };
  };

  const buildQrValue = (reservation) => {
    return JSON.stringify(buildTicketPayload(reservation));
  };

  const handleDownloadTicketJson = (reservation) => {
    const payload = buildTicketPayload(reservation);
    const jsonContent = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `ticket-CH-${reservation.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handlePrintTicket = (reservationId) => {
    setPrintingTicketId(reservationId);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.print();
        setPrintingTicketId(null);
      });
    });
  };

  useEffect(() => {
    if (printingTicketId) {
      document.body.classList.add("printing-ticket");
      document.body.setAttribute("data-print-ticket-id", String(printingTicketId));
      return;
    }

    document.body.classList.remove("printing-ticket");
    document.body.removeAttribute("data-print-ticket-id");
  }, [printingTicketId]);

  useEffect(() => {
    return () => {
      document.body.classList.remove("printing-ticket");
      document.body.removeAttribute("data-print-ticket-id");
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 py-6">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Mes tickets</h1>
            <p className="text-slate-600">Tickets generes a partir de vos reservations payees.</p>
          </div>

          <button
            type="button"
            onClick={loadReservations}
            className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700"
          >
            Actualiser
          </button>
        </div>

        {error && <p className="mb-4 text-red-700 bg-red-100 rounded-lg p-3">{error}</p>}
        {loading && <p className="text-slate-600">Chargement des tickets...</p>}

        {!loading && !error && paidReservations.length === 0 && (
          <p className="text-slate-600">Aucun ticket pour le moment. Payez une reservation pour generer un ticket.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paidReservations.map((reservation) => {
            const ticketNumber = `CH-${reservation.id}`;
            const seats = Array.isArray(reservation.seats) ? reservation.seats : [];
            const shouldHideForPrint =
              printingTicketId !== null && Number(printingTicketId) !== Number(reservation.id);

            return (
              <article
                key={reservation.id}
                data-ticket-card
                data-ticket-id={String(reservation.id)}
                className={`ticket-card bg-white border border-slate-200 rounded-xl shadow p-4 print:shadow-none print:border-slate-300 ${
                  shouldHideForPrint ? "hidden print:hidden" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-slate-800">Ticket {ticketNumber}</p>
                    <p className="text-sm text-slate-600">Reservation #{reservation.id}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">paid</span>
                </div>

                <div className="mt-3 text-sm text-slate-700 space-y-1">
                  <p>
                    <span className="font-medium">Session:</span> {reservation.room_session_id || "-"}
                  </p>
                  <p>
                    <span className="font-medium">Nombre de sieges:</span> {seats.length}
                  </p>
                  <p>
                    <span className="font-medium">Total:</span> {reservation.total_price || 0} DT
                  </p>
                  <p>
                    <span className="font-medium">Date paiement:</span> {formatDateTime(reservation.paid_at)}
                  </p>
                  <p>
                    <span className="font-medium">Reference:</span> {reservation.payment_reference || "-"}
                  </p>
                </div>

                {seats.length > 0 && (
                  <p className="mt-2 text-sm text-slate-700">
                    <span className="font-medium">Sieges:</span>{" "}
                    {seats
                      .map((seat) => `${seat.row || "A"}${seat.number || "?"}`)
                      .join(", ")}
                  </p>
                )}

                <div className="mt-4 flex flex-col items-center gap-3">
                  <div className="p-2 bg-white border border-slate-200 rounded">
                    <QRCodeSVG value={buildQrValue(reservation)} size={176} />
                  </div>
                  <p className="text-xs text-slate-500 text-center">
                    Scannez ce QR a l'entree pour verifier le ticket.
                  </p>
                </div>

                <div className="mt-4 flex gap-2 print:hidden">
                  <button
                    type="button"
                    onClick={() => handlePrintTicket(reservation.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Imprimer / PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadTicketJson(reservation)}
                    className="bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800"
                  >
                    Telecharger JSON
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/*
  Mini glossaire (debutant):

  paidReservations:
  - Filtre uniquement les reservations dont le statut est paid.

  ticket_number:
  - Identifiant d'affichage du ticket (ex: CH-12).

  QR code:
  - Image generee a partir des infos du ticket.
  - Ici: genere localement avec qrcode.react.

  window.print():
  - Ouvre la fenetre d'impression du navigateur.
  - Permet aussi d'enregistrer en PDF.

  handleDownloadTicketJson:
  - Telecharge un fichier .json avec les infos du ticket.
  - Utile pour tester un scanner ou debugger rapidement.
*/