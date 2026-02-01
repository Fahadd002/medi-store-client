import { redirect } from "next/navigation";

export default function AdminDefault() {
  redirect("/admin-dashboard");
  return null;
}