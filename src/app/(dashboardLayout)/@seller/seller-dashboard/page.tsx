import { redirect } from "next/navigation";

export default function AdminDashboard() {
  redirect("/seller-dashboard/orders");
  return null;
}