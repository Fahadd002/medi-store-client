import { redirect } from "next/navigation";

export default function AdminDashboard() {
  redirect("/admin-dashboard/orders");
  return null;
}
