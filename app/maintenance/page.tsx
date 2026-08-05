import MaintenancePage from "@/components/MaintenancePage";

// Reached only via a middleware rewrite (proxy.ts) when maintenance mode is
// on and the visitor isn't a logged-in admin — never linked to directly.
export default function Maintenance() {
  return <MaintenancePage />;
}
