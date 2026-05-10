import { logoutAdminAction } from "@/app/actions/admin";

export function LogoutButton() {
  return (
    <form action={logoutAdminAction}>
      <button className="secondary-button" type="submit">
        Sair
      </button>
    </form>
  );
}
