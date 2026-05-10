import { AddGuestForm } from "@/app/components/AddGuestForm";
import { AdminLoginForm } from "@/app/components/AdminLoginForm";
import { LogoutButton } from "@/app/components/LogoutButton";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getGuestDashboard, type GuestStatus } from "@/lib/guests";
import { logger } from "@/lib/logger";
import { getSessionId } from "@/lib/session";

function formatGuestStatusLabel(guestStatus: GuestStatus): string {
  if (guestStatus === "confirmed") {
    return "confirmado";
  }

  if (guestStatus === "cancelled") {
    return "cancelado";
  }

  return "pendente";
}

export default async function AdminPage() {
  const sessionId = await getSessionId();
  logger.info("adminPage", sessionId, "Starting admin page loading flow");
  const adminAuthenticated = await isAdminAuthenticated();

  if (!adminAuthenticated) {
    logger.debug("adminPage", sessionId, "Rendering admin login view");
    return (
      <main className="admin-page admin-login-page">
        <section className="admin-panel admin-login-panel">
          <p className="section-kicker">Admin</p>
          <h1>Controle de presença</h1>
          <AdminLoginForm />
        </section>
      </main>
    );
  }

  const guestDashboard = await getGuestDashboard(sessionId);
  logger.info("adminPage", sessionId, "Admin page loaded successfully");

  return (
    <main className="admin-page">
      <section className="admin-panel">
        <div className="admin-header">
          <div>
            <p className="section-kicker">Admin</p>
            <h1>Controle de presença</h1>
          </div>
          <LogoutButton />
        </div>

        <div className="summary-grid" aria-label="Resumo de confirmações">
          <div>
            <span>Total</span>
            <strong>{guestDashboard.summary.totalGuests}</strong>
          </div>
          <div>
            <span>Confirmados</span>
            <strong>{guestDashboard.summary.confirmedGuests}</strong>
          </div>
          <div>
            <span>Cancelados</span>
            <strong>{guestDashboard.summary.cancelledGuests}</strong>
          </div>
          <div>
            <span>Pendentes</span>
            <strong>{guestDashboard.summary.pendingGuests}</strong>
          </div>
        </div>

        <AddGuestForm />

        <div className="guest-table-wrap">
          <table className="guest-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {guestDashboard.guests.map((guest) => (
                <tr key={guest.id}>
                  <td>{guest.name}</td>
                  <td>
                    <span className={`status-pill status-${guest.status}`}>{formatGuestStatusLabel(guest.status)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
